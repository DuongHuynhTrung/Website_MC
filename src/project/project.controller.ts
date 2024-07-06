import { AddResponsiblePersonToProjectDto } from './dto/add-responsible-person-to-project.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { Project } from './entities/project.entity';
import { ProjectStatusEnum } from './enum/project-status.enum';
import { CreateProjectWithTokenDto } from './dto/create-project-with-token.dto';
import { CreateProjectWithoutTokenDto } from './dto/create-project-without-token.dto';
import { UserProject } from 'src/user-project/entities/user-project.entity';

@ApiTags('Project')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({
    summary: 'Business create a new project',
  })
  @ApiOkResponse({
    description: 'Project created successfully!',
    type: Project,
  })
  @ApiBadRequestResponse({
    description:
      'Có lỗi khi tạo Người phụ trách. Vui lòng kiểm tra lại thông tin!',
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy Người phụ trách!',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi khi tạo dự án. Vui lòng kiểm tra lại thông tin!',
  })
  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectService.createProject(createProjectDto);
  }

  @ApiOperation({
    summary: 'Business/Admin create a new project',
  })
  @ApiOkResponse({
    description: 'Project created successfully!',
    type: Project,
  })
  @ApiBadRequestResponse({
    description:
      'Có lỗi khi tạo Người phụ trách. Vui lòng kiểm tra lại thông tin!',
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy Người phụ trách!',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi khi tạo dự án. Vui lòng kiểm tra lại thông tin!',
  })
  @Post('withAuthentication')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.BUSINESS)
  @UseGuards(JwtGuard)
  createProjectWithToken(
    @Body() createProjectWithTokenDto: CreateProjectWithTokenDto,
    @GetUser() user: User,
  ): Promise<Project> {
    return this.projectService.createProjectWithToken(
      createProjectWithTokenDto,
      user,
    );
  }

  @ApiOperation({
    summary: 'Business create a new project',
  })
  @ApiOkResponse({
    description: 'Project created successfully!',
    type: Project,
  })
  @ApiBadRequestResponse({
    description:
      'Có lỗi khi tạo Người phụ trách. Vui lòng kiểm tra lại thông tin!',
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy Người phụ trách!',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi khi tạo dự án. Vui lòng kiểm tra lại thông tin!',
  })
  @Post('withoutAuthentication')
  createProjectWithoutToken(
    @Body() createProjectWithoutTokenDto: CreateProjectWithoutTokenDto,
  ): Promise<Project> {
    return this.projectService.createProjectWithoutToken(
      createProjectWithoutTokenDto,
    );
  }

  @ApiOperation({
    summary: 'Add Responsible Person to Project',
  })
  @ApiOkResponse({
    description: 'Add successfully!',
    type: Project,
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtGuard)
  @Post('addResponsiblePersonToProject')
  addResponsiblePersonToProject(
    @Body() addResponsiblePersonToProjectDto: AddResponsiblePersonToProjectDto,
  ): Promise<UserProject> {
    return this.projectService.addResponsiblePersonToProject(
      addResponsiblePersonToProjectDto,
    );
  }

  @ApiOperation({
    summary: 'Get all projects For Admin',
  })
  @ApiOkResponse({
    description: 'All projects have been retrieved',
    type: [Project],
  })
  @Get('firstProject')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtGuard)
  getFistProjectsForAdmin(): Promise<Project[]> {
    return this.projectService.getAllFirstProject();
  }

  @ApiOperation({
    summary: 'Get all projects For Admin',
  })
  @ApiOkResponse({
    description: 'All projects have been retrieved',
    type: [Project],
  })
  @Get('admin')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtGuard)
  getProjectsForAdmin(): Promise<[{ totalProjects: number }, Project[]]> {
    return this.projectService.getProjectsForAdmin();
  }

  @ApiOperation({
    summary: 'Get all projects',
  })
  @ApiOkResponse({
    description: 'All projects have been retrieved',
    type: [Project],
  })
  @Get()
  getProjects(): Promise<[{ totalProjects: number }, Project[]]> {
    return this.projectService.getProjects();
  }

  @ApiOperation({
    summary: 'Get all projects for business',
  })
  @ApiOkResponse({
    description: 'All projects have been retrieved',
    type: [Project],
  })
  @ApiNotFoundResponse({
    description: 'Hệ thống không có dự án nào!',
  })
  @Get('business')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS)
  @UseGuards(JwtGuard)
  getProjectsOfBusiness(@GetUser() business: User): Promise<Project[]> {
    return this.projectService.getProjectsOfBusiness(business);
  }

  @ApiOperation({
    summary: 'Get all projects for responsiblePerson',
  })
  @ApiOkResponse({
    description: 'All projects have been retrieved',
    type: [Project],
  })
  @ApiNotFoundResponse({
    description: 'Hệ thống không có dự án nào!',
  })
  @Get('responsiblePerson')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.RESPONSIBLE_PERSON)
  @UseGuards(JwtGuard)
  getProjectsOfResponsiblePerson(
    @GetUser() responsiblePerson: User,
  ): Promise<Project[]> {
    return this.projectService.getProjectsOfResponsiblePerson(
      responsiblePerson,
    );
  }

  @ApiOperation({
    summary: 'Get project By Project ID',
  })
  @ApiOkResponse({
    description: 'Project with ID have been retrieved',
    type: Project,
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy dự án với mã số ${id} ',
  })
  @ApiBearerAuth()
  @Get(':id')
  getProjectByID(@Param('id') id: number): Promise<Project> {
    return this.projectService.getProjectById(id);
  }

  @ApiOperation({
    summary: 'Delete project By Project ID',
  })
  @ApiOkResponse({
    description: 'Project with ID have been retrieved',
    type: Project,
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy dự án với mã số ${id} ',
  })
  @ApiBearerAuth()
  @Delete(':id')
  deleteProject(@Param('id') id: number): Promise<Project> {
    return this.projectService.deleteProject(id);
  }

  @ApiOperation({
    summary: 'Admin Confirm Project',
  })
  @ApiOkResponse({
    description: 'Project Confirm have been retrieved',
    type: Project,
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy dự án với mã số ${id} ',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi khi công bố dự án',
  })
  @Patch('confirm-project/:id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtGuard)
  confirmProject(@Param('id') id: number): Promise<Project> {
    return this.projectService.confirmProject(id);
  }

  @ApiOperation({
    summary: 'Admin Update Project Before Confirm',
  })
  @ApiOkResponse({
    description: 'Project Confirm have been retrieved',
    type: Project,
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy dự án với mã số ${id} ',
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy Người phụ trách!',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi khi công bố dự án',
  })
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtGuard)
  updateProjectById(
    @Param('id') id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectService.updateProjectById(id, updateProjectDto);
  }

  @ApiOperation({
    summary: 'Lecturer change Project Status',
  })
  @ApiOkResponse({
    description: 'Project after change status have been retrieved',
    type: Project,
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy dự án với mã số ${id} ',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi khi thay đổi trạng thái của dự án',
  })
  @Patch('changeStatus/:projectId/:projectStatus/:groupId')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS, RoleEnum.RESPONSIBLE_PERSON)
  @UseGuards(JwtGuard)
  async changeProjectStatus(
    @Param('projectId') projectId: number,
    @Param('projectStatus') projectStatus: ProjectStatusEnum,
    @Param('groupId') groupId: number,
    @GetUser() user: User,
  ): Promise<Project> {
    return this.projectService.changeProjectStatus(
      projectId,
      projectStatus,
      groupId,
      user,
    );
  }

  @ApiOperation({
    summary: 'Admin Statistics Project',
  })
  @ApiOkResponse({
    description: 'Number Projects follow Status have been retrieved',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi xảy ra khi thống kê dự án theo trạng thái',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtGuard)
  @Get('admin/statisticsProject')
  statisticsProject(): Promise<
    {
      key: string;
      value: number;
    }[]
  > {
    return this.projectService.statisticsProject();
  }

  @ApiOperation({
    summary: 'Admin Statistics Project By BusinessType',
  })
  @ApiOkResponse({
    description: 'Number Projects follow Business Type have been retrieved',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi xảy ra khi thống kê dự án theo loại doanh nghiệp',
  })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtGuard)
  @Get('admin/statisticsProjectByBusinessType')
  statisticsProjectByBusinessType() {
    return this.projectService.statisticsProjectByBusinessType();
  }
}
