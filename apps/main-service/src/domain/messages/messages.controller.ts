import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateMessageWithImagesDto } from './dto/create-message-image.dto';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { AuthUser } from 'src/common/interfaces/user.interface';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':id')
  async getMessage(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.messagesService.getMessageById(id, user.id);
  }

  @Get('/workspaces/:workspaceId/conversations/:conversationId/messages')
  async getMessagesByConversation(
    @Param('workspaceId') workspaceId: string,
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messagesService.getMessagesByConversation(
      conversationId,
      workspaceId,
      user.id,
    );
  }

  @Post('withImage')
  async createMessage(
    @Body()
    createMessageDto: CreateMessageDto,
    @CurrentUser() user: AuthUser,
  ) {
    return await this.messagesService.createMessage(user.id, createMessageDto);
  }
  @Post('create-with-images')
  @UseInterceptors(FilesInterceptor('files')) // Interceptor để upload nhiều file
  async createMessageWithImages(
    @Body() createMessageDto: CreateMessageWithImagesDto,
    @UploadedFiles() files: Express.Multer.File[], // File được gửi lên qua form-data
    @CurrentUser() user: AuthUser,
  ) {
    try {
      // Tạo message và upload ảnh
      const result = await this.messagesService.createMessageWithImages(
        user.id,
        files,
        createMessageDto,
      );

      return {
        messageId: result.messageId,
        images: result.images,
      };
    } catch (error) {
      // Kiểm tra lỗi và trả về thông báo tương ứng
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':messageId')
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messagesService.updateMessage(
      messageId,
      user.id,
      updateMessageDto.content,
    );
  }

  @Delete(':messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messagesService.deleteMessage(messageId, user.id);
  }
}
