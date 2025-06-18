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
  Request,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserGateway } from './user.gateway'; // 👈 import gateway

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly userGateway: UserGateway, // 👈 inject gateway
  ) {}

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
    const teacherId = req.user.userId; // 👈 changed from `sub` to `userId`
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

  @Post('online-names')
async getOnlineUserNames(@Body() body: { userIds: string[] }) {
  console.log('📦 Received userIds:', body.userIds); // 👈 Add this

  if (!body.userIds || !Array.isArray(body.userIds)) {
    throw new BadRequestException('userIds must be an array');
  }

  const objectIds = body.userIds.map(id => new Types.ObjectId(id));
  const result = await this.userModel.find({ _id: { $in: objectIds } }, { name: 1 }).lean();
  console.log('📤 Result:', result); // 👈 Add this
  return result;
}

}
