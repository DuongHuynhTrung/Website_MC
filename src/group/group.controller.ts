import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { RelationshipStatusEnum } from 'src/user-group/enum/relationship-status.enum';

@ApiTags('Group')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  create(@Body() createGroupDto: CreateGroupDto, @GetUser() user: User) {
    return this.groupService.createGroup(user, createGroupDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  findAllGroups() {
    return this.groupService.getGroups();
  }

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
