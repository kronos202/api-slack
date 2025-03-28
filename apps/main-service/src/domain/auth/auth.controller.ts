import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { LocalAuthGuard } from 'src/common/guards/local.guard';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { SerializeInterceptor } from 'src/common/interceptors/serialize.interceptor';
import { NullableType } from 'src/utils/types/nullable';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { UserService } from '../user/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiOperationDecorator,
  ApiResponseType,
} from 'src/common/decorators/api-operation.decorator';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { RefreshJwtAuthGuard } from 'src/common/guards/refresh-jwt-auth.guard';
import { TokenResponseDto } from './dto/token-response.dto';
import { IS_SKIP_GLOBAL_JWT_GUARD } from 'src/common/decorators/ignore-global-jwt.decorator';
import { AuthUser } from 'src/common/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/user.decorator';

@Controller('auth')
@ApiTags('auth')
@UseInterceptors(SerializeInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('refresh')
  @ApiOperationDecorator({
    type: TokenResponseDto,
    summary: 'User Login ',
    description: 'User Login',
    path: '/api/auth/email/login',
  })
  @IS_SKIP_GLOBAL_JWT_GUARD()
  @UseGuards(RefreshJwtAuthGuard)
  public refresh(@CurrentUser() user: AuthUser): Promise<TokenResponseDto> {
    return this.authService.refreshToken({
      sessionId: user.sessionId,
      hash: user.hash,
    });
  }

  @Post('email/login')
  @ApiOperationDecorator({
    type: LoginResponseDto,
    bodyType: AuthEmailLoginDto,
    summary: 'User Login ',
    description: 'User Login',
    path: '/api/auth/email/login',
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  async login(
    @Body() authEmailLoginDto: AuthEmailLoginDto,
  ): Promise<LoginResponseDto> {
    return await this.authService.login(authEmailLoginDto);
  }

  @Post('email/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperationDecorator({
    bodyType: AuthRegisterLoginDto,
    summary: 'User Register',
    description: 'User Register',
    path: '/api/auth/email/register',
    exclude: [ApiResponseType.Unauthorized, ApiResponseType.Forbidden],
  })
  @Public()
  async register(
    @Body() authRegisterLoginDto: AuthRegisterLoginDto,
  ): Promise<void> {
    return await this.authService.register(authRegisterLoginDto);
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperationDecorator({
    bodyType: AuthConfirmEmailDto,
    summary: 'email confirm',
    description: 'email confirm',
    path: '/api/auth/email/confirm',
    exclude: [ApiResponseType.Unauthorized, ApiResponseType.Forbidden],
  })
  @Public()
  async confirmEmail(
    @Body() authConfirmEmailDto: AuthConfirmEmailDto,
  ): Promise<void> {
    return await this.authService.confirmEmail(authConfirmEmailDto.hash);
  }

  @ApiOperationDecorator({
    type: UserResponseDto,
    summary: 'get me',
    description: 'get me',
    path: '/api/auth/me',
    exclude: [ApiResponseType.Forbidden],
  })
  @ApiBearerAuth()
  @Get('me')
  public me(
    @CurrentUser() user: AuthUser,
  ): Promise<NullableType<UserResponseDto>> {
    return this.authService.me(user);
  }

  @Post('forgot/password')
  @ApiOperationDecorator({
    bodyType: AuthForgotPasswordDto,
    summary: 'forgot password',
    description: 'forgot password',
    path: '/api/auth/forgot/password',
    exclude: [ApiResponseType.Forbidden, ApiResponseType.Unauthorized],
  })
  @Public()
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @ApiOperationDecorator({
    bodyType: AuthResetPasswordDto,
    summary: 'reset password',
    description: 'reset password',
    path: '/api/auth/reset/password',
    exclude: [ApiResponseType.Forbidden, ApiResponseType.Unauthorized],
  })
  @Public()
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(
    @CurrentUser() user: Pick<AuthUser, 'sessionId'>,
  ): Promise<void> {
    await this.authService.logout({
      sessionId: user.sessionId,
    });
  }

  @ApiOperationDecorator({
    type: UserResponseDto,
    bodyType: AuthUpdateDto,
    summary: 'update me',
    description: 'update me',
    path: '/api/auth/me',
  })
  @Patch('me')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  public update(
    @CurrentUser() user: AuthUser,
    @Body() userDto: AuthUpdateDto,
  ): Promise<NullableType<UserResponseDto>> {
    return this.userService.updateUser(user.id, userDto, user.sessionId);
  }

  @Delete('me')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@CurrentUser() user: AuthUser): Promise<void> {
    return this.userService.softDeleteUser(user.id);
  }
}
