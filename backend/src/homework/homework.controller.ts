import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { Roles } from 'src/auth/roles.decorator';

@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  // Create a new homework
  @Post()
  async create(@Body() body: any) {
    return this.homeworkService.createHomework(body);
  }

  // Get all homeworks (for admin or global view)
  @Get()
  async getAll() {
    return this.homeworkService.getAllHomeworks();
  }

  // Get homeworks by student ID
  @Get('student/:id')
  async getByStudent(@Param('id') id: string) {
    return this.homeworkService.getHomeworkByStudent(id);
  }

  // Get homeworks by teacher ID
  @Get('teacher/:id')
  async getByTeacher(@Param('id') id: string) {
    return this.homeworkService.getHomeworkByTeacher(id);
  }

  // Delete homework by ID
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.homeworkService.deleteHomework(id);
  }
  // HomeworkController
@Get('student/:studentId')
@Roles('student')
async getHomeworkForStudent(@Param('studentId') studentId: string) {
  return this.homeworkService.getHomeworkForStudent(studentId);
}

}
