// src/message/message.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Message } from './message.schema';
import { Model } from 'mongoose';
import { GroupService } from '../group/group.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private groupService: GroupService,
  ) { }

  async createMessage(data: { sender: string | Types.ObjectId; group: string | Types.ObjectId; text: string }) {
  const message = await this.messageModel.create(data);
  return message.populate('sender', 'name role'); // ✅ Fix: populate sender details
}


  async sendMessage(user: any, groupId: string, text: string) {
    const group = await this.groupService.getGroupById(groupId);
    if (!group) {
  throw new ForbiddenException('Group not found');
}

    const isAuthorized =
      group.teacher._id.toString() === user._id.toString() ||
      group.students.some((s) => s._id.toString() === user._id.toString()) ||
      ['admin', 'super-admin'].includes(user.role);

    if (!isAuthorized) throw new ForbiddenException('Not allowed');

    return this.messageModel.create({
      sender: user.sub,
      text,
      group: groupId,
    });
  }
  async getMessages(user: any, groupId: string) {
  const group = await this.groupService.getGroupById(groupId);

  const userId = user.userId?.toString(); // ✅ correct
  const teacherId = group.teacher?._id?.toString();
  const studentIds = group.students.map((s) => s?._id?.toString());

  const isAuthorized =
    teacherId === userId ||
    studentIds.includes(userId) ||
    ['admin', 'super-admin'].includes(user.role);

  if (!isAuthorized) {
    throw new ForbiddenException('Not allowed');
  }

  // ✅ Convert groupId to ObjectId
  const objectGroupId = new Types.ObjectId(groupId);

  return this.messageModel
    .find({ group: objectGroupId }) // ✅ Use ObjectId
    .populate('sender', 'name role')
    .sort({ createdAt: 1 });
}
  

}
