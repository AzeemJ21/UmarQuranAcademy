// src/group/group.service.ts
import { BadRequestException, Injectable, NotFoundException,  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group } from './group.schema';
import { Model, Types,  } from 'mongoose';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
  ) {}

  async createGroup(name: string, teacher: string, students: string[]) {
    return this.groupModel.create({
      name,
      teacher,
      students,
    });
  }

  async getUserGroups(userId: string, role: string) {
    if (role === 'admin' || role === 'super-admin') {
      return this.groupModel.find().populate('teacher students');
    }

    if (role === 'teacher') {
      return this.groupModel.find({ teacher: userId }).populate('students');
    }

    return this.groupModel.find({ students: userId }).populate('teacher');
  }

//  async getGroupById(id: string) {
//   if (!Types.ObjectId.isValid(id)) return null;
//   return this.groupModel.findById(id).populate('teacher students');
// }
async getGroupById(groupId: string) {
  if (!Types.ObjectId.isValid(groupId)) {
    throw new BadRequestException('Invalid group ID');
  }

  const group = await this.groupModel
    .findById(groupId)
    .populate('teacher')
    .populate('students');

  if (!group) {
    throw new NotFoundException('Group not found');
  }

  return group;
}

}
