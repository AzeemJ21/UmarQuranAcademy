import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-welcome')
  async sendWelcome(@Body() body: { email: string; name: string }) {
    await this.mailService.sendWelcomeEmail(body.email, body.name);
    return { message: 'Welcome email sent' };
  }
}
