import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { Roles } from 'src/auth/roles.decorator';

@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post()
  async create(@Body() body: any) {
    return this.homeworkService.createHomework(body);
  }

  @Get()
  async getAll() {
    return this.homeworkService.getAllHomeworks();
  }

  @Get('student/:id')
  @Roles('student')
  async getByStudent(@Param('id') id: string) {
    return this.homeworkService.getHomeworkByStudent(id);
  }

  @Get('teacher/:id')
  async getByTeacher(@Param('id') id: string) {
    return this.homeworkService.getHomeworkByTeacher(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.homeworkService.deleteHomework(id);
  }

  @Put(':id') // ✅ ADD THIS
  async update(@Param('id') id: string, @Body() body: any) {
    return this.homeworkService.updateHomework(id, body);
  }
}
