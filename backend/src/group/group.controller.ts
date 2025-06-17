import { Controller, Post, Body, Get, Param, Req, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ✅ import this

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ apply both guards at controller level
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @Roles('admin', 'super-admin')
  createGroup(@Body() body: any) {
    const { name, teacherId, studentIds } = body;
    return this.groupService.createGroup(name, teacherId, studentIds);
  }

  @Get()
  getUserGroups(@Req() req: any) {
    return this.groupService.getUserGroups(req.user.userId, req.user.role);
  }

  @Get(':id')
  getGroupById(@Param('id') id: string) {
    return this.groupService.getGroupById(id);
  }
}
