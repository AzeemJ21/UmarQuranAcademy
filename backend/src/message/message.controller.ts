import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { Express } from 'express';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: 'chat_uploads',
    resource_type: 'auto',
    public_id: file.originalname.split('.')[0], 
  }),
});

@Controller('groups/:groupId/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async sendMessage(
    @Param('groupId') groupId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.messageService.sendMessage(
      req.user,
      groupId,
      body.text,
      body.fileUrl,
      body.fileName,
      body.fileType,
    );
  }

  
  @Get()
  async getMessages(@Param('groupId') groupId: string, @Req() req: any) {
    const messages = await this.messageService.getMessages(req.user, groupId);
    return Array.isArray(messages) ? messages : [];
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('groupId') groupId: string,
    @Req() req: any,
  ) {
    console.log('📂 Uploading file to group:', groupId);
    console.log('👤 User:', req.user);
    console.log('📎 File:', file);

    if (!file?.path) {
      return { error: 'Upload failed. File not found.' };
    }

    return {
      url: file.path,
      originalName: file.originalname,
      type: file.mimetype,
    };
  }
}
