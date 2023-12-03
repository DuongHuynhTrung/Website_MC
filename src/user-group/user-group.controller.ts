import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UserGroupService } from './user-group.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserGroup } from './entities/user-group.entity';
import { JwtGuard } from 'src/auth/jwt.guard';

@ApiTags('User-Group')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('user-group')
export class UserGroupController {
  constructor(private readonly userGroupService: UserGroupService) {}

  @Post()
  createUserGroup(@Body() createUserGroupDto: CreateUserGroupDto) {
    return this.userGroupService.createUserGroup(createUserGroupDto);
  }

  @Get('users/:id')
  findAllUserGroupByUserId(@Param('id') id: number) {
    return this.userGroupService.findAllUserGroupByUserId(id);
  }

  @Get('groups/:id')
  findAllUserGroupByGroup(@Param('id') id: number) {
    return this.userGroupService.findAllUserGroupByGroupId(id);
  }

  @Get(':id')
  findUserGroupById(@Param('id') id: number): Promise<UserGroup> {
    return this.userGroupService.findUserGroupById(id);
  }

  // @Get(':id')
  // findUserGroupByGroup(@Param('id') id: string) {
  //   return this.userGroupService.findUserGroupByGroup(+id);
  // }
}
