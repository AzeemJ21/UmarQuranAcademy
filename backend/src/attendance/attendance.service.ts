import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Attendance } from './attendance.schema';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { User, UserDocument } from 'src/users/user.schema';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,

    private readonly mailService: MailService,
  ) {}

 async markAttendance(data: any) {
  const attendance = new this.attendanceModel(data);
  const saved = await attendance.save();

  // Step 1: Fetch student by ID
  const student = await this.userModel.findById(data.student);
  if (!student || !student.email) {
    console.error('❌ Student not found or email missing');
    return saved;
  }

  // Step 2: Send email to student
  await this.mailService.sendMail(
    student.email,
    'Your Attendance Has Been Marked',
    `
      <h3>Dear ${student.name || 'Student'},</h3>
      <p>Your attendance has been marked.</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Status:</strong> ${data.status}</p>
    `
  );

  return saved;
}

  async getAllAttendance() {
    return this.attendanceModel
      .find()
      .populate('student', 'name')  // Populate only the 'name' field
      .populate('teacher', 'name')
      .exec();
  }

  async getAttendanceByStudent(studentId: string) {
    return this.attendanceModel
      .find({ student: studentId })
      .populate('student', 'name')
      .exec();
  }

  async getAttendanceByTeacher(teacherId: string) {
    return this.attendanceModel
      .find({ teacher: teacherId })
      .populate('teacher', 'name')
      .exec();
  }
}
