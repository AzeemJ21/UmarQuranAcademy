import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group } from './group.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
  ) {}

  async createGroup(name: string, memberIds: string[]) {
    if (!name || !Array.isArray(memberIds) || memberIds.length < 2) {
      throw new BadRequestException('At least two members required to create a group.');
    }

    return this.groupModel.create({
      name,
      members: memberIds.map(id => new Types.ObjectId(id)),
    });
  }

  async getGroupsForUser(user: any) {
    console.log('➡️ User received in service:', user); // ✅ Debug log

    const userId = user.userId; // ✅ Use only userId consistently

    if (['super-admin', 'admin'].includes(user.role)) {
      // 🟢 Admins get all groups
      return this.groupModel
        .find({})
        .populate('members', 'name role')
        .sort({ createdAt: -1 });
    }

    // 👤 Teachers & Students get only their assigned groups
    return this.groupModel
      .find({ members: new Types.ObjectId(userId) }) // ✅ Ensure ObjectId match
      .populate('members', 'name role')
      .sort({ createdAt: -1 });
  }

  async getGroupById(groupId: string) {
    if (!Types.ObjectId.isValid(groupId)) {
      throw new BadRequestException('Invalid group ID');
    }

    const group = await this.groupModel
      .findById(groupId)
      .populate('members', 'name email role');

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }
}
