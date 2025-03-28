import { Controller, Body, Param, Put } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { AuthUser } from 'src/common/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorators/user.decorator';

@Controller('messages/:messageId/reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Put('toggle')
  async toggleReaction(
    @Param('messageId') messageId: string,
    @Body() body: { value: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.reactionsService.toggleReaction(user.id, messageId, body.value);
  }
}
