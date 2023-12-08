import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UserGroupService } from './user-group.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGroup } from './entities/user-group.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('User-Group')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('user-group')
export class UserGroupController {
  constructor(private readonly userGroupService: UserGroupService) {}

  @ApiOperation({ summary: 'Create User Group' })
  @Post()
  createUserGroup(@Body() createUserGroupDto: CreateUserGroupDto) {
    return this.userGroupService.createUserGroup(createUserGroupDto);
  }

  @ApiOperation({ summary: 'Get All User Group of User' })
  @Get('users')
  findAllUserGroupByUserId(@GetUser() user: User) {
    return this.userGroupService.findAllUserGroupByUserId(user);
  }

  @ApiOperation({ summary: 'Get All User Group By GroupID' })
  @Get('groups/:id')
  findAllUserGroupByGroup(@Param('id') id: number) {
    return this.userGroupService.findAllUserGroupByGroupId(id);
  }

  @ApiOperation({ summary: 'Get User Group By GroupID' })
  @Get(':id')
  findUserGroupById(@Param('id') id: number): Promise<UserGroup> {
    return this.userGroupService.findUserGroupById(id);
  }

  // @Get(':id')
  // findUserGroupByGroup(@Param('id') id: string) {
  //   return this.userGroupService.findUserGroupByGroup(+id);
  // }
}
