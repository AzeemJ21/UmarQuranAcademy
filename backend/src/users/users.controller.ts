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
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserGateway } from './user.gateway';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly userGateway: UserGateway,
  ) {}

  @Get()
  @Roles('super-admin')
  async getAllUsers(@Query('role') role?: string) {
    const users = await this.userService.findAll(role);
    return { users };
  }

  @Get(':id')
  @Roles('super-admin')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return { user };
  }

  @Put(':id')
  @Roles('super-admin')
  async updateUser(@Param('id') id: string, @Body() body) {
    const user = await this.userService.update(id, body);
    return { user };
  }

  @Delete(':id')
  @Roles('super-admin')
  async deleteUser(@Param('id') id: string) {
    const result = await this.userService.delete(id);
    return { message: result.message };
  }

  @Put('assign-students/:teacherId')
  @Roles('super-admin')
  async assignStudentsToTeacher(
    @Param('teacherId') teacherId: string,
    @Body('studentIds') studentIds: string[],
  ) {
    const updatedTeacher = await this.userService.assignStudentsToTeacher(teacherId, studentIds);
    return { teacher: updatedTeacher };
  }

  @Get('my-students')
  @Roles('teacher')
  async getStudentsOfTeacher(@Req() req) {
    const teacherId = req.user.userId;
    const students = await this.userService.getStudentsOfTeacher(teacherId);
    return { students };
  }

  @Get('teacher/:teacherId/students')
  async getStudentsByTeacher(@Param('teacherId') teacherId: string) {
    const students = await this.userService.getStudentsByTeacher(teacherId);
    return { students };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return { user: req.user };
  }

  @Get('students/:teacherId')
  async getAssignedStudents(@Param('teacherId') teacherId: string) {
    const students = await this.userService.getStudentsAssignedToTeacher(teacherId);
    return { students };
  }

  @Post('online-names')
  async getOnlineUserNames(@Body() body: { userIds: string[] }) {
    if (!body.userIds || !Array.isArray(body.userIds)) {
      throw new BadRequestException('userIds must be an array');
    }

    const objectIds = body.userIds.map(id => new Types.ObjectId(id));
    const result = await this.userModel.find({ _id: { $in: objectIds } }, { name: 1 }).lean();
    return { users: result };
  }
}
