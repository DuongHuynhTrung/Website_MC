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

@ApiTags('Project')
@ApiBearerAuth()
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
      'Có lỗi khi tạo Người chịu trách nhiệm. Vui lòng kiểm tra lại thông tin!',
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy Người chịu trách nhiệm!',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi khi tạo dự án. Vui lòng kiểm tra lại thông tin!',
  })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS, RoleEnum.ADMIN)
  @UseGuards(JwtGuard)
  createProject(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectService.createProject(createProjectDto);
  }

  @ApiOperation({
    summary: 'Get all projects For Admin',
  })
  @ApiOkResponse({
    description: 'All projects have been retrieved',
    type: [Project],
  })
  @Get('firstProject')
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
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS)
  @UseGuards(JwtGuard)
  getProjectsOfBusiness(@GetUser() business: User): Promise<Project[]> {
    return this.projectService.getProjectsOfBusiness(business);
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
    description: 'Không tìm thấy Người chịu trách nhiệm!',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi khi công bố dự án',
  })
  @Patch(':id')
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
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS)
  @UseGuards(JwtGuard)
  async changeProjectStatus(
    @Param('projectId') projectId: number,
    @Param('projectStatus') projectStatus: ProjectStatusEnum,
    @Param('groupId') groupId: number,
  ): Promise<Project> {
    return this.projectService.changeProjectStatus(
      projectId,
      projectStatus,
      groupId,
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
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtGuard)
  @Get('admin/statisticsProjectByBusinessType')
  statisticsProjectByBusinessType() {
    return this.projectService.statisticsProjectByBusinessType();
  }
}
