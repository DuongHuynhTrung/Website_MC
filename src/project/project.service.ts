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
import { UserService } from 'src/user/user.service';
import { UpdateResponsiblePersonDto } from 'src/responsible_person/dto/update-responsible_person.dto';
import { ProjectStatusEnum } from './enum/project-status.enum';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    private readonly responsiblePersonService: ResponsiblePersonService,

    private readonly userService: UserService,
  ) {}
  async createProject(
    business: User,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
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
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      const projects = await this.projectRepository.find({
        relations: ['business', 'responsible_person'],
      });
      if (!projects || projects.length === 0) {
        return [];
      }
      return projects;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getProjectsOfBusiness(business: User): Promise<Project[]> {
    try {
      let projects = await this.projectRepository.find({
        relations: ['business'],
      });
      projects = projects.filter(
        (project) => project.business?._id === business._id,
      );
      if (!projects || projects.length === 0) {
        return [];
      }
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

  async updateProjectById(id: number, updateProjectDto: UpdateProjectDto) {
    //check if project already exists
    const project = await this.getProjectById(id);

    //cheeck Responsible Person
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
      return await this.getProjectById(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async confirmProject(id: number): Promise<Project> {
    const project: Project = await this.getProjectById(id);
    project.project_status = ProjectStatusEnum.PUBLIC;
    try {
      const result: Project = await this.projectRepository.save(project);
      if (!result) {
        throw new InternalServerErrorException('Có lỗi khi công bố dự án');
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }

  async changeProjectStatus(
    projectId: number,
    projectStatus: ProjectStatusEnum,
  ): Promise<void> {
    const project: Project = await this.getProjectById(projectId);
    project.project_status = projectStatus;
    try {
      await this.projectRepository.save(project);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi thay đổi trạng thái dự án',
      );
    }
  }
}
