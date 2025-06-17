import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @Roles('admin', 'super-admin')
  async createGroup(@Body() body: { name: string; memberIds: string[] }) {
    const { name, memberIds } = body;
    return this.groupService.createGroup(name, memberIds);
  }


  @Get()
async getUserGroups(@Req() req) {
  const user = req.user;
  const groups = await this.groupService.getGroupsForUser(user);
  return groups;
}

  // ✅ Get specific group by ID
  @Get(':id')
  getGroupById(@Param('id') id: string) {
    return this.groupService.getGroupById(id);
  }
}
