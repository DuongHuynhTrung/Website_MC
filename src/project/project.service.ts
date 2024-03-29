import { User } from './../user/entities/user.entity';
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponsiblePersonService } from 'src/responsible_person/responsible_person.service';
import { ProjectStatusEnum } from './enum/project-status.enum';
import { GroupService } from 'src/group/group.service';

import { UserService } from 'src/user/user.service';
import { SocketGateway } from 'socket.gateway';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    private readonly responsiblePersonService: ResponsiblePersonService,

    private readonly userService: UserService,

    private readonly groupService: GroupService,
  ) {}

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    const responsiblePerson =
      await this.responsiblePersonService.getResponsiblePerson(
        createProjectDto.email_responsible_person,
      );
    if (!responsiblePerson) {
      throw new NotFoundException(
        `Không tìm thấy người phụ trách với email ${createProjectDto.email_responsible_person}`,
      );
    }

    const business = await this.userService.getUserByEmail(
      createProjectDto.businessEmail,
    );

    const project = this.projectRepository.create(createProjectDto);
    if (!project) {
      throw new BadRequestException(
        'Có lỗi khi tạo dự án. Vui lòng kiểm tra lại thông tin!',
      );
    }
    project.responsible_person = responsiblePerson;
    project.business = business;
    try {
      const result = await this.projectRepository.save(project);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi khi tạo dự án. Vui lòng kiểm tra lại thông tin!',
        );
      }
      await this.handleGetProjects();
      await this.handleGetProjectsOfBusiness(business);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllFirstProject(): Promise<Project[]> {
    try {
      const projects: Project[] = await this.projectRepository.find({
        where: {
          is_first_project: true,
        },
        relations: ['business', 'responsible_person'],
      });
      if (!projects) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi truy xuất tất cả dự án lần đầu đăng',
        );
      }
      return projects;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getProjectsForAdmin(
    page: number,
  ): Promise<[{ totalProjects: number }, Project[]]> {
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    try {
      const projects = await this.projectRepository.find({
        relations: ['business', 'responsible_person'],
      });
      if (!projects || projects.length === 0) {
        return [{ totalProjects: 0 }, []];
      }
      projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const totalProjects = projects.length;
      await this.handleGetProjects();
      return [{ totalProjects }, projects.slice(startIndex, endIndex)];
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getProjects(): Promise<[{ totalProjects: number }, Project[]]> {
    try {
      let projects = await this.projectRepository.find({
        relations: ['business', 'responsible_person'],
      });
      if (!projects || projects.length === 0) {
        return [{ totalProjects: 0 }, []];
      }
      projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      projects = projects.filter(
        (project) => project.project_status == ProjectStatusEnum.PUBLIC,
      );
      const totalProjects = projects.length;
      await this.handleGetProjects();
      return [{ totalProjects }, projects];
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getProjectsOfBusiness(business: User): Promise<Project[]> {
    try {
      let projects = await this.projectRepository.find({
        relations: ['business', 'responsible_person'],
      });
      projects = projects.filter(
        (project) => project.business?.id === business.id,
      );
      if (!projects || projects.length === 0) {
        return [];
      }
      await this.handleGetProjectsOfBusiness(business);
      return projects;
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong when trying to retrieve projects of business',
      );
    }
  }

  async getProjectById(id: number): Promise<Project> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id },
        relations: ['business', 'responsible_person'],
      });

      if (!project) {
        throw new NotFoundException(`Không tìm thấy dự án với mã số ${id} `);
      }
      return project;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateProjectById(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    //check if project already exists
    const project = await this.getProjectById(id);

    //check Responsible Person
    const responsiblePerson =
      await this.responsiblePersonService.getResponsiblePerson(
        updateProjectDto.email_responsible_person,
      );
    if (!responsiblePerson) {
      throw new NotFoundException(
        `Không tìm thấy người phụ trách với email ${updateProjectDto.email_responsible_person}`,
      );
    }

    try {
      project.name_project = updateProjectDto.name_project;
      project.business_type = updateProjectDto.business_type;
      project.purpose = updateProjectDto.purpose;
      project.target_object = updateProjectDto.target_object;
      project.note = updateProjectDto.note;
      project.document_related_link = updateProjectDto?.document_related_link;
      project.request = updateProjectDto?.request;
      project.project_implement_time = updateProjectDto.project_implement_time;
      project.project_start_date = updateProjectDto.project_start_date;
      project.is_extent = updateProjectDto?.is_extent;
      project.project_expected_end_date =
        updateProjectDto.project_expected_end_date;
      project.expected_budget = updateProjectDto.expected_budget;
      project.is_first_project = updateProjectDto?.is_first_project;
      project.responsible_person = responsiblePerson;
      if (project.project_status == ProjectStatusEnum.PENDING) {
        project.project_status = ProjectStatusEnum.PUBLIC;
      }
      await this.projectRepository.save(project);
      await this.handleGetProjects();
      await this.handleGetProjectsOfBusiness(project.business);
      return await this.getProjectById(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async confirmProject(id: number): Promise<Project> {
    const project: Project = await this.getProjectById(id);
    if (project.project_status != ProjectStatusEnum.PENDING) {
      throw new BadRequestException(
        'Chỉ dự án đang chờ phê duyệt mới có thể phê duyệt',
      );
    }
    project.project_status = ProjectStatusEnum.PUBLIC;
    try {
      const result: Project = await this.projectRepository.save(project);
      if (!result) {
        throw new InternalServerErrorException('Có lỗi khi công bố dự án');
      }
      await this.handleGetProjects();
      await this.handleGetProjectsOfBusiness(project.business);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeProjectStatus(
    projectId: number,
    projectStatus: ProjectStatusEnum,
    groupId: number,
  ): Promise<Project> {
    const project: Project = await this.getProjectById(projectId);
    if (
      projectStatus !== ProjectStatusEnum.DONE &&
      projectStatus !== ProjectStatusEnum.END &&
      projectStatus !== ProjectStatusEnum.PROCESSING
    ) {
      throw new BadRequestException('Trạng thái của dự án không hợp lệ');
    }
    //Business Update Project Status To Processing------------------------------------
    if (
      projectStatus === ProjectStatusEnum.PROCESSING &&
      project.project_status == ProjectStatusEnum.PUBLIC
    ) {
      project.project_status = projectStatus;
      // project.project_actual_start_date = new Date();
      try {
        const result: Project = await this.projectRepository.save(project);
        console.log(result);
        await this.handleGetProjects();
        await this.handleGetProjectsOfBusiness(project.business);
        return await this.getProjectById(result.id);
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi thay đổi trạng thái dự án sang triển khai',
        );
      }
    }

    //Business Update Project Status To End/Done------------------------------------
    if (
      (projectStatus === ProjectStatusEnum.DONE ||
        projectStatus === ProjectStatusEnum.END) &&
      project.project_status == ProjectStatusEnum.PROCESSING
    ) {
      project.project_status = projectStatus;
      // project.project_actual_end_date = new Date();

      try {
        const result: Project = await this.projectRepository.save(project);
        await this.groupService.changeGroupStatusToFree(groupId);
        await this.handleGetProjects();
        await this.handleGetProjectsOfBusiness(project.business);
        return await this.getProjectById(result.id);
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi thay đổi trạng thái dự án sang hoàn thành/kết thúc',
        );
      }
    } else {
      throw new BadRequestException(
        'Chỉ có thể chuyển trạng thái dự án sang hoàn thành/kết thúc khi dự án đang tiến hành',
      );
    }
  }

  async statisticsProject(): Promise<
    {
      key: string;
      value: number;
    }[]
  > {
    try {
      const dataProject: Project[] = await this.projectRepository.find();
      if (!dataProject || dataProject.length === 0) {
        return null;
      }
      const tmpCountData: { [key: string]: number } = {
        Pending: 0,
        Public: 0,
        Processing: 0,
        Done: 0,
        End: 0,
        Expired: 0,
      };

      dataProject.forEach((project: Project) => {
        const project_status = project.project_status;
        tmpCountData[project_status] = tmpCountData[project_status] + 1;
      });

      const result: { key: string; value: number }[] = Object.keys(
        tmpCountData,
      ).map((key) => ({ key, value: tmpCountData[key] }));
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi thống kê dự án theo trạng thái',
      );
    }
  }

  // async statisticsSpecializationField(): Promise<
  //   {
  //     key: string;
  //     value: number;
  //   }[]
  // > {
  //   try {
  //     const dataProject: Project[] = await this.projectRepository.find();

  //     const tmpCountData: { [key: string]: number } = {};

  //     dataProject.forEach((projects: Project) => {
  //       const specializationField = projects.specialized_field;
  //       tmpCountData[specializationField] =
  //         (tmpCountData[specializationField] || 0) + 1;
  //     });

  //     const result: { key: string; value: number }[] = Object.keys(
  //       tmpCountData,
  //     ).map((key) => ({ key, value: tmpCountData[key] }));
  //     return result;
  //   } catch {
  //     throw new InternalServerErrorException(
  //       'Có lỗi xảy ra khi thống kê dự án',
  //     );
  //   }
  // }

  async handleGetProjects(): Promise<void> {
    try {
      let projects = await this.projectRepository.find({
        relations: ['business', 'responsible_person'],
      });
      if (!projects || projects.length === 0) {
        SocketGateway.handleGetProjects({
          totalProjects: 0,
          projects: [],
        });
      } else {
        projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        projects = projects.filter(
          (project) => project.project_status == ProjectStatusEnum.PUBLIC,
        );
        const totalProjects = projects.length;
        SocketGateway.handleGetProjects({
          totalProjects: totalProjects,
          projects: projects,
        });
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async handleGetProjectsOfBusiness(business: User): Promise<void> {
    try {
      let projects = await this.projectRepository.find({
        relations: ['business', 'responsible_person'],
      });
      projects = projects.filter(
        (project) => project.business?.id === business.id,
      );
      if (!projects || projects.length === 0) {
        SocketGateway.handleGetProjectsOfBusiness({
          totalProjects: 0,
          projects: [],
          emailBusiness: business.email,
        });
      } else {
        const totalProjects: number = projects.length;
        SocketGateway.handleGetProjectsOfBusiness({
          totalProjects: totalProjects,
          projects: projects,
          emailBusiness: business.email,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong when trying to retrieve projects of business',
      );
    }
  }
}
