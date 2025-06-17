import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Homework } from './homework.schema';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/user.schema';

@Injectable()
export class HomeworkService {
  constructor(
    @InjectModel(Homework.name) private homeworkModel: Model<Homework>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailService: MailService,
  ) {}

  async createHomework(data: any) {
  const newHomework = new this.homeworkModel(data);
  const savedHomework = await newHomework.save();

  // Ensure data.students is an array of ObjectIds or strings
  if (!data.student || !Array.isArray(data.student)) {
    throw new Error('Invalid or missing students array');
  }

  // Fetch students by IDs
  const students = await this.userModel.find({
    _id: { $in: data.student },
  });

  // Send email to each student
  for (const student of students) {
    if (!student.email) continue; // skip if email is missing

    await this.mailService.sendMail(
      student.email,
      '📘 New Homework Assigned',
      `
        <h3>Dear ${student.name || 'Student'},</h3>
        <p>You have a new homework assigned by your teacher.</p>
        <p><strong>Sabaq:</strong> ${data.sabaq || 'N/A'}</p>
        <p><strong>Sabqi:</strong> ${data.sabqi || 'N/A'}</p>
        <p><strong>Manzil:</strong> ${data.manzil || 'N/A'}</p>
        ${data.comment ? `<p><strong>Comment:</strong> ${data.comment}</p>` : ''}
        <p>Best of luck!</p>
      `
    );
  }

  return savedHomework;
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
