import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Attendance } from './attendance.schema';
import { Model } from 'mongoose';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>
  ) {}

  async markAttendance(data: any) {
    const attendance = new this.attendanceModel(data);
    return attendance.save();
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
