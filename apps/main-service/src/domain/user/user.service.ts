import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, Session, User } from '@prisma/client';
import { NullableType } from 'src/utils/types/nullable';
import { BaseService } from 'src/common/services/base.service';
import { DatabaseService } from 'src/database/database.service';
import { EncryptHelper } from 'src/utils/helpers/encrypt.helper';
import { SessionsService } from '../sessions/sessions.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'src/config/auth/auth-config.types';
import { getAuthConfig, getTemplateConfig } from 'src/utils/helpers/getConfig';
import { TemplateConfig } from 'src/config/template/template.type';
import { SendgridService } from '@packages/integration';

@Injectable()
export class UserService extends BaseService<
  CreateUserDto,
  UpdateUserDto,
  Prisma.UserWhereInput,
  Prisma.UserSelect,
  Prisma.UserInclude
> {
  private readonly templateConfig: TemplateConfig;
  private readonly authConfig: AuthConfig;
  constructor(
    protected databaseService: DatabaseService,
    private readonly sessionService: SessionsService,
    private readonly jwtService: JwtService,
    private readonly authConfigService: ConfigService<AuthConfig>,
    private readonly sendgridService: SendgridService,
    private readonly templateConfigService: ConfigService<TemplateConfig>,
  ) {
    super(databaseService, 'User');
    this.authConfig = getAuthConfig(this.authConfigService);
    this.templateConfig = getTemplateConfig(this.templateConfigService);
  }

  findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    return this.databaseService.user.findFirst({
      where: {
        socialId,
        provider,
      },
    });
  }

  async findOneOrFail(id: User['id']): Promise<NullableType<User>> {
    return await this.findOrFailById({ id });
  }

  async findOneOrFailByEmail(emailS: string): Promise<User> {
    const user = await this.databaseService.user.findUnique({
      where: { email: emailS },
    });
    if (!user) {
      throw new NotFoundException('không tìm thấy user');
    }

    return user;
  }

  async findOneOrFailByEmailWithRoles(email: string): Promise<User> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async findAll() {
    return await this.findWithPagination({});
  }

  async updateForgotPassword(
    userId: User['id'],
    updateUserDto?: UpdateUserDto,
  ) {
    const existingUser = await this.databaseService.user.findFirstOrThrow({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    console.log('updateUserDto: ', updateUserDto);

    if (updateUserDto) {
      if (updateUserDto.password) {
        updateUserDto.password = EncryptHelper.hash(updateUserDto.password);
      }
    }
    await this.databaseService.user.update({
      where: { id: userId },
      data: { ...updateUserDto },
    });
  }

  async activateUser(userId: User['id']) {
    await this.databaseService.user.update({
      where: { id: userId },
      data: { active: true },
    });
  }

  async updateUser(
    userId: User['id'],
    updateUserDto?: UpdateUserDto,
    sessionId?: Session['id'],
  ) {
    const existingUser = await this.databaseService.user.findFirstOrThrow({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    console.log('updateUserDto: ', updateUserDto);

    if (updateUserDto) {
      if (updateUserDto.password) {
        if (!updateUserDto.oldPassword) {
          throw new BadRequestException(
            'Old password is required to update password.',
          );
        }

        // TODO: Check if provider = google -> handle differently

        const isOldPasswordValid = EncryptHelper.compare(
          updateUserDto.oldPassword,
          existingUser.password ?? '',
        );

        if (!isOldPasswordValid) {
          throw new BadRequestException('Old password is incorrect.');
        } else {
          await this.sessionService.deleteByUserIdWithExclude(
            existingUser.id,
            sessionId,
          );
        }
        updateUserDto.password = EncryptHelper.hash(updateUserDto.password);
      }

      if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
        const userByEmail = await this.databaseService.user.findUnique({
          where: { email: updateUserDto.email },
        });

        if (userByEmail && userByEmail.id !== existingUser.id) {
          throw new UnprocessableEntityException('emailExists');
        }

        const hash = await this.jwtService.signAsync(
          {
            confirmEmailUserId: existingUser.id,
            newEmail: updateUserDto.email,
          },
          {
            secret: this.authConfig.confirm_email_secret,
            expiresIn: this.authConfig.confirm_email_expires,
          },
        );

        await this.sendgridService.sendDynamicEmail(
          updateUserDto.email,
          this.templateConfig.activation_email_template_id!,
          {
            username: existingUser.username,
            verification_link: hash,
          },
        );
      }

      delete updateUserDto.oldPassword;
      // delete updateUserDto.email;
    }

    await this.databaseService.user.update({
      where: { id: userId },
      data: { ...updateUserDto },
    });

    return this.findOneOrFail(userId);
  }

  async deleteOneOrFail(id: User['id']): Promise<NullableType<void>> {
    return await this.deleteOrFailById(id);
  }

  async softDeleteUser(userId: string): Promise<void> {
    const where: Prisma.UserWhereInput = {
      id: userId,
    };

    try {
      await this.update({
        where,
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      throw new UnprocessableEntityException(
        'Failed to soft delete user.',
        error.message,
      );
    }
  }

  async restoreUser(userId: string) {
    const where: Prisma.UserWhereInput = {
      id: userId,
    };
    return await this.update({
      where,
      data: {
        deletedAt: null,
      },
    });
  }
}
