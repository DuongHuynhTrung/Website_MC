import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { RelationshipStatusEnum } from 'src/user-group/enum/relationship-status.enum';
import { UserGroup } from 'src/user-group/entities/user-group.entity';

@ApiTags('Group')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiOperation({ summary: 'Create a new group' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  create(@Body() createGroupDto: CreateGroupDto, @GetUser() user: User) {
    return this.groupService.createGroup(user, createGroupDto);
  }

  @ApiOperation({ summary: 'Admin get All Groups' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  findAllGroups() {
    return this.groupService.getGroups();
  }

  @ApiOperation({ summary: 'Get Members of Group' })
  @Get('getMembers/:groupId')
  getMembersOfGroup(@Param('groupId') groupId: number): Promise<UserGroup[]> {
    return this.groupService.getMembersOfGroup(groupId);
  }

  @ApiOperation({ summary: 'Leader invite Members' })
  @Get('invite-member/:groupId/:userEmail')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  inviteMember(
    @Param('groupId') groupId: number,
    @Param('userEmail') userEmail: string,
    @GetUser() user: User,
  ) {
    return this.groupService.inviteMember(groupId, userEmail, user);
  }

  @ApiOperation({ summary: 'Student or Lecturer reply Invite' })
  @Patch('reply-invite/:userGroupId/:relationshipStatus')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT, RoleEnum.LECTURER)
  replyInvite(
    @Param('userGroupId') userGroupId: number,
    @Param('relationshipStatus') relationshipStatus: RelationshipStatusEnum,
    @GetUser() user: User,
  ) {
    return this.groupService.replyInvite(userGroupId, relationshipStatus, user);
  }

  @ApiOperation({ summary: 'Lecturer kick member' })
  @Patch('kick-member/:groupId/:userId')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.LECTURER)
  kickMember(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
    @GetUser() user: User,
  ) {
    return this.groupService.kickMember(groupId, userId, user);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.groupService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
  //   return this.groupService.update(+id, updateGroupDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.groupService.remove(+id);
  // }
}
