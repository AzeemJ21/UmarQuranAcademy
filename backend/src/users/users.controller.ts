import {
  Controller,
  Get,
  Query,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Request
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  
  constructor(private readonly userService: UsersService) { }

  @Get()
  @Roles('super-admin')
  async getAllUsers(@Query('role') role?: string) {
    return this.userService.findAll(role);
  }

  @Put(':id')
  @Roles('super-admin')
  async updateUser(@Param('id') id: string, @Body() body) {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  @Roles('super-admin')
  async deleteUser(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Put('assign-students/:teacherId')
  @Roles('super-admin')
  async assignStudentsToTeacher(
    @Param('teacherId') teacherId: string,
    @Body('studentIds') studentIds: string[],
  ) {
    return this.userService.assignStudentsToTeacher(teacherId, studentIds);
  }

  @Get('my-students')
  @Roles('teacher')
  async getStudentsOfTeacher(@Req() req) {
    const teacherId = req.user.sub;
    return this.userService.getStudentsOfTeacher(teacherId);
  }
  @Get('teacher/:teacherId/students')
  async getStudentsByTeacher(@Param('teacherId') teacherId: string) {
    return this.userService.getStudentsByTeacher(teacherId);
  }
 
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @Get('students/:teacherId')
  async getAssignedStudents(@Param('teacherId') teacherId: string) {
    return this.userService.getStudentsAssignedToTeacher(teacherId);
  }
}
