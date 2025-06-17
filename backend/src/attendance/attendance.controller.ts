// src/attendance/attendance.controller.ts

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async markAttendance(@Body() data: any) {
    return this.attendanceService.markAttendance(data);
  }

  @Get()
  async getAllAttendance() {
    return this.attendanceService.getAllAttendance();
  }

  @Get('student/:id')
  async getStudentAttendance(@Param('id') id: string) {
    return this.attendanceService.getAttendanceByStudent(id);
  }

  @Get('teacher/:id')
  async getTeacherAttendance(@Param('id') id: string) {
    return this.attendanceService.getAttendanceByTeacher(id);
  }
}
