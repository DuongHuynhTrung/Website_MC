import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserProjectService } from './user-project.service';
import { CreateUserProjectDto } from './dto/create-user-project.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { UserProject } from './entities/user-project.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { RolesGuard } from 'src/auth/role.guard';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('User-Project')
@Controller('user-project')
export class UserProjectController {
  constructor(private readonly userProjectService: UserProjectService) {}

  @ApiOperation({ summary: 'Create User Project' })
  @Post()
  createUserProject(@Body() createUserProjectDto: CreateUserProjectDto) {
    return this.userProjectService.createUserProject(createUserProjectDto);
  }

  @ApiOperation({ summary: 'Get All User Project of User' })
  @Get('users')
  findAllUserProjectByUserId(@GetUser() user: User) {
    return this.userProjectService.findAllUserProjectByUserId(user);
  }

  @ApiOperation({ summary: 'Get All User Project By ProjectId' })
  @Get('projects/:id')
  findAllUserProjectByProjectId(@Param('id') id: number) {
    return this.userProjectService.findAllUserProjectByProjectId(id);
  }

  @ApiOperation({ summary: 'Get User Project By ID' })
  @Get(':id')
  findUserProjectById(@Param('id') id: number): Promise<UserProject> {
    return this.userProjectService.findUserProjectById(id);
  }

  @Get('business/:ProjectId')
  findLecturerByProjectId(
    @Param('ProjectId') ProjectId: number,
  ): Promise<UserProject> {
    return this.userProjectService.getBusinessOfProject(ProjectId);
  }

  @Get('responsible-person/:ProjectId')
  getResponsibleOfProject(
    @Param('ProjectId') ProjectId: number,
  ): Promise<UserProject[]> {
    return this.userProjectService.getResponsibleOfProject(ProjectId);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.BUSINESS)
  @UseGuards(RolesGuard)
  @Delete('removeUser/:ProjectId/:UserId')
  removeUserFromProject(
    @Param('ProjectId') ProjectId: number,
    @Param('UserId') UserId: number,
    @GetUser() user: User,
  ): Promise<UserProject> {
    return this.userProjectService.removeUserFromProject(
      ProjectId,
      UserId,
      user,
    );
  }
}
