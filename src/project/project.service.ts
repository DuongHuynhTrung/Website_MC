import { User } from './../user/entities/user.entity';
import { CreateResponsiblePersonDto } from './../responsible_person/dto/create-responsible_person.dto';
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
import { UpdateResponsiblePersonDto } from 'src/responsible_person/dto/update-responsible_person.dto';
import { ProjectStatusEnum } from './enum/project-status.enum';
import * as moment from 'moment';
import { GroupService } from 'src/group/group.service';
import { SocketGateway } from 'socket.gateway';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    private readonly responsiblePersonService: ResponsiblePersonService,

    private readonly groupService: GroupService,

    private readonly socketGateway: SocketGateway,
  ) {}
  async createProject(
    business: User,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    const current_date = moment(new Date());
    const expired_date = moment(
      createProjectDto.project_registration_expired_date,
    );
    const oneDateLaterCurrentDate = current_date.clone().add(1, 'day');
    if (oneDateLaterCurrentDate.isAfter(expired_date)) {
      throw new BadRequestException(
        'Ngày hết hạn đăng ký pitching phải sau ngày hiện tại 1 ngày',
      );
    }

    const start_date = moment(createProjectDto.project_start_date);
    const sevenDateAfterCurrentDate = current_date.clone().add(7, 'days');
    if (sevenDateAfterCurrentDate.isAfter(start_date)) {
      throw new BadRequestException(
        'Ngày bắt đầu phải sau ngày hiện tại 7 ngày',
      );
    }

    const expected_end_date = moment(
      createProjectDto.project_expected_end_date,
    );
    if (start_date.isAfter(expected_end_date)) {
      throw new BadRequestException(
        'Ngày bắt đầu phải trước ngày mong muốn kết thúc',
      );
    }

    //check the shortest range between start_date and expected_end_date is in 2 months
    const twoMonthsLaterOfStartDate = start_date.clone().add(2, 'months');
    if (expected_end_date.isBefore(twoMonthsLaterOfStartDate)) {
      throw new BadRequestException(
        'Một dự án ít nhất phải thực hiện trong 2 tháng',
      );
    }

    //check the largest range between start_date and expected_end_date is in 3 months
    const threeMonthsLaterOfStartDate = start_date.clone().add(3, 'months');
    if (expected_end_date.isAfter(threeMonthsLaterOfStartDate)) {
      throw new BadRequestException(
        'Một dự án chỉ có thể được thực hiện trong 3 tháng',
      );
    }
    let responsiblePerson =
      await this.responsiblePersonService.getResponsiblePerson(
        createProjectDto.email_responsible_person,
      );
    if (!responsiblePerson) {
      const createResponsiblePersonDto = new CreateResponsiblePersonDto({
        email: createProjectDto.email_responsible_person,
        fullname: createProjectDto.fullname,
        position: createProjectDto.position,
        phone_number: createProjectDto.phone_number,
      });
      responsiblePerson =
        await this.responsiblePersonService.createResponsiblePerson(
          createResponsiblePersonDto,
        );
    } else {
      const updateResponsiblePersonDto = new UpdateResponsiblePersonDto({
        email: createProjectDto.email_responsible_person,
        fullname: createProjectDto.fullname,
        position: createProjectDto.position,
        phone_number: createProjectDto.phone_number,
      });
      responsiblePerson =
        await this.responsiblePersonService.updateResponsiblePerson(
          updateResponsiblePersonDto,
        );
    }

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
    if (project.project_status != ProjectStatusEnum.PENDING) {
      throw new BadRequestException(
        'Chỉ dự án đang trong giai đoạn chờ phê duyệt mới được cập nhật thông tin',
      );
    }
    //check Responsible Person
    let responsiblePerson =
      await this.responsiblePersonService.getResponsiblePerson(
        updateProjectDto.email_responsible_person,
      );
    if (!responsiblePerson) {
      const createResponsiblePersonDto = new CreateResponsiblePersonDto({
        email: updateProjectDto.email_responsible_person,
        fullname: updateProjectDto.fullname,
        position: updateProjectDto.position,
        phone_number: updateProjectDto.phone_number,
      });

      responsiblePerson =
        await this.responsiblePersonService.createResponsiblePerson(
          createResponsiblePersonDto,
        );
    } else {
      const updateResponsiblePersonDto = new UpdateResponsiblePersonDto({
        email: updateProjectDto.email_responsible_person,
        fullname: updateProjectDto.fullname,
        position: updateProjectDto.position,
        phone_number: updateProjectDto.phone_number,
      });
      responsiblePerson =
        await this.responsiblePersonService.updateResponsiblePerson(
          updateResponsiblePersonDto,
        );
    }

    try {
      project.business_sector = updateProjectDto.business_sector;
      project.description_project = updateProjectDto.description_project;
      project.document_related_link = updateProjectDto?.document_related_link;
      project.name_project = updateProjectDto.name_project;
      project.note = updateProjectDto.note;
      project.purpose = updateProjectDto.purpose;
      project.request = updateProjectDto.request;
      project.responsible_person = responsiblePerson;
      project.specialized_field = updateProjectDto.specialized_field;
      project.project_expected_end_date =
        updateProjectDto.project_expected_end_date;
      project.project_registration_expired_date =
        updateProjectDto.project_registration_expired_date;
      project.project_start_date = updateProjectDto.project_start_date;
      project.project_status = ProjectStatusEnum.PUBLIC;
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
      try {
        const result: Project = await this.projectRepository.save(project);
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
      project.project_actual_end_date = new Date();

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

  async handleGetProjects(): Promise<void> {
    try {
      let projects = await this.projectRepository.find({
        relations: ['business', 'responsible_person'],
      });
      if (!projects || projects.length === 0) {
        this.socketGateway.handleGetProjects({
          totalProjects: 0,
          projects: [],
        });
      }
      projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      projects = projects.filter(
        (project) => project.project_status == ProjectStatusEnum.PUBLIC,
      );
      const totalProjects = projects.length;
      this.socketGateway.handleGetProjects({
        totalProjects: totalProjects,
        projects: projects,
      });
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
        this.socketGateway.handleGetProjects({
          totalProjects: 0,
          projects: [],
        });
      }
      const totalProjects: number = projects.length;
      this.socketGateway.handleGetProjects({
        totalProjects: totalProjects,
        projects: projects,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong when trying to retrieve projects of business',
      );
    }
  }
}
