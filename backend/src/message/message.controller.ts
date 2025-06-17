import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('groups/:groupId/messages')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ Apply both guards
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  sendMessage(@Param('groupId') groupId: string, @Body() body: any, @Req() req: any) {
    console.log('✅ req.user in POST:', req.user); // Optional debug
    return this.messageService.sendMessage(req.user, groupId, body.text);
  }

  @Get()
async getMessages(@Param('groupId') groupId: string, @Req() req: any) {
  const user = req.user;
  const messages = await this.messageService.getMessages(user, groupId);
  return Array.isArray(messages) ? messages : [];
}


  // @Get()
  // async getMessages(@Param('groupId') groupId: string, @Req() req: any) {
  //   console.log('✅ req.user in GET:', req.user); // Optional debug
  //   const user = req.user;
  //   const messages = await this.messageService.getMessages(user, groupId);
  //   return Array.isArray(messages) ? messages : [];
  // }
}
