import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Homework } from './homework.schema';
import { Model } from 'mongoose';

@Injectable()
export class HomeworkService {
  constructor(
    @InjectModel(Homework.name) private homeworkModel: Model<Homework>,
  ) {}

  async createHomework(data: any) {
    const newHomework = new this.homeworkModel(data);
    return newHomework.save();
  }

  async getAllHomeworks() {
    return this.homeworkModel.find().populate('teacher').populate('student');
  }

  async getHomeworkByStudent(studentId: string) {
    return this.homeworkModel.find({ student: studentId }).populate('teacher');
  }

  async getHomeworkByTeacher(teacherId: string) {
    return this.homeworkModel
      .find({ teacher: teacherId })
      .populate('teacher', 'name')
      .populate('student', 'name');
  }

  async deleteHomework(id: string) {
    return this.homeworkModel.findByIdAndDelete(id);
  }

  async updateHomework(id: string, data: any) {
    return this.homeworkModel.findByIdAndUpdate(id, data, { new: true })
      .populate('teacher', 'name')
      .populate('student', 'name');
  }
  // HomeworkService
async getHomeworkForStudent(studentId: string) {
  return this.homeworkModel.find({ student: studentId });
}

}
