import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UserGroupService } from './user-group.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGroup } from './entities/user-group.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { RolesGuard } from 'src/auth/role.guard';
import { RoleEnum } from 'src/role/enum/role.enum';
import { Roles } from 'src/auth/role.decorator';

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

  @ApiOperation({ summary: 'Get User Group By ID' })
  @Get(':id')
  findUserGroupById(@Param('id') id: number): Promise<UserGroup> {
    return this.userGroupService.findUserGroupById(id);
  }

  @Get('lecturer/:groupId')
  findLecturerByGroupId(
    @Param('groupId') groupId: number,
  ): Promise<UserGroup[]> {
    return this.userGroupService.checkGroupHasLecturer(groupId);
  }

  @Delete('removeUser/:groupId/:userId')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  removeUserFromGroup(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ): Promise<UserGroup> {
    return this.userGroupService.removeUserFromUserGroup(userId, groupId);
  }
}
