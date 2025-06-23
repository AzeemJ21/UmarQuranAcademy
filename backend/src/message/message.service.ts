import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, Model } from 'mongoose';
import { Message } from './message.schema';
import { GroupService } from '../group/group.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private groupService: GroupService,
  ) {}

  async createMessage(data: {
    sender: string | Types.ObjectId;
    group: string | Types.ObjectId;
    text?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
  }) {
    const message = await this.messageModel.create(data);
    return message.populate('sender', 'name role');
  }

  async sendMessage(user: any, groupId: string, text: string, fileUrl?: string, fileName?: string, fileType?: string) {
  const group = await this.groupService.getGroupById(groupId);

  if (!group) throw new ForbiddenException('Group not found');

  const userId = user._id?.toString() || user.sub;

  const isAuthorized =
    group.members?.some((m) => m._id.toString() === userId) ||
    ['admin', 'super-admin'].includes(user.role);

  if (!isAuthorized) throw new ForbiddenException('Not allowed');

  if (!text && !fileUrl) {
    throw new BadRequestException('Message must have text or a file');
  }

  return this.messageModel.create({
    sender: new Types.ObjectId(userId),
    text: text || '',
    fileUrl,
    fileName,
    fileType,
    group: new Types.ObjectId(groupId),
  });
}


  async getMessages(user: any, groupId: string) {
    const group = await this.groupService.getGroupById(groupId);
    if (!group) {
      throw new ForbiddenException('Group not found');
    }

    const userId = user._id?.toString() || user.userId || user.sub;

    const isAuthorized =
      group.members?.some((m) => m._id.toString() === userId) ||
      ['admin', 'super-admin'].includes(user.role);

    if (!isAuthorized) {
      throw new ForbiddenException('Not allowed');
    }

    return this.messageModel
      .find({ group: new Types.ObjectId(groupId) })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });
  }
}
