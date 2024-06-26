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
import { SocketGateway } from 'socket.gateway';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoleEnum } from 'src/role/enum/role.enum';
import * as moment from 'moment';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { NotificationService } from 'src/notification/notification.service';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { NotificationTypeEnum } from 'src/notification/enum/notification-type.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RegisterPitching)
    private readonly registerPitchingRepository: Repository<RegisterPitching>,

    private readonly responsiblePersonService: ResponsiblePersonService,

    private readonly groupService: GroupService,

    private readonly userGroupService: UserGroupService,

    private readonly notificationService: NotificationService,

    private readonly configService: ConfigService,
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

    const business = await this.userRepository.findOne({
      where: {
        email: createProjectDto.businessEmail,
      },
    });
    if (!business) {
      throw new BadRequestException(
        `Không tìm thấy doannh nghiệp với email ${createProjectDto.businessEmail}`,
      );
    }

    if (business.role_name != RoleEnum.BUSINESS) {
      throw new BadRequestException(
        `Email đã tồn tại trong hệ thống với vai trò không phải doanh nghiệp. Vui lòng liên hệ với Admin để giải quyết`,
      );
    }
    const project = this.projectRepository.create(createProjectDto);
    if (!project) {
      throw new BadRequestException(
        'Có lỗi khi tạo dự án. Vui lòng kiểm tra lại thông tin!',
      );
    }
    if (createProjectDto.is_created_by_admin) {
      project.project_status = ProjectStatusEnum.PUBLIC;
      project.is_first_project = false;
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
      return projects.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getProjectsForAdmin(): Promise<[{ totalProjects: number }, Project[]]> {
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
      return [
        { totalProjects },
        projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      ];
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getProjects(): Promise<[{ totalProjects: number }, Project[]]> {
    try {
      let projects = await this.projectRepository.find({
        where: {
          project_status: ProjectStatusEnum.PUBLIC,
          is_first_project: false,
        },
        relations: ['business', 'responsible_person'],
      });
      if (!projects || projects.length === 0) {
        return [{ totalProjects: 0 }, []];
      }
      projects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      projects = projects.filter((project) => {
        const parts = this.extractProjectDates(
          project.project_implement_time,
        ).project_expected_end_date.split('/');
        const month = parseInt(parts[0], 10);
        const year = parseInt(parts[1], 10);
        const currentDate = new Date();
        const projectImplementTime = new Date(year, month - 1);
        if (currentDate <= projectImplementTime) return project;
      });
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

  async deleteProject(id: number): Promise<Project> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id },
        relations: ['business', 'responsible_person'],
      });
      if (!project) {
        throw new NotFoundException(`Không tìm thấy dự án với mã số ${id} `);
      }
      if (
        project.project_status != ProjectStatusEnum.PENDING &&
        project.project_status != ProjectStatusEnum.PUBLIC
      ) {
        throw new BadRequestException(
          'Chỉ có thể xóa dự án đang chờ xác thực và công khai',
        );
      }
      if (project.project_status == ProjectStatusEnum.PUBLIC) {
        const projectId = project.id;
        const checkProjectHaveRegisterPitching: RegisterPitching[] =
          await this.registerPitchingRepository
            .createQueryBuilder('registerPitching')
            .leftJoinAndSelect('registerPitching.group', 'group')
            .leftJoinAndSelect('registerPitching.project', 'project')
            .where('project.id = :projectId', { projectId })
            .getMany();
        if (checkProjectHaveRegisterPitching.length > 0) {
          checkProjectHaveRegisterPitching.forEach(async (registerPitching) => {
            const leader: UserGroup =
              await this.userGroupService.getLeaderOfGroup(
                registerPitching.group.id,
              );
            //Send mail to Leader of group
            const createNotificationToLeaderDto: CreateNotificationDto =
              new CreateNotificationDto(
                NotificationTypeEnum.DELETE_PROJECT,
                `${project.business.fullname} đã xóa dự án ${project.name_project} mà nhóm đã đăng ký pitching`,
                this.configService.get('MAIL_USER'),
                leader.user.email,
              );
            await this.notificationService.createNotification(
              createNotificationToLeaderDto,
            );

            //Send mail to Lecturer of Group
            const lecturers: UserGroup[] =
              await this.userGroupService.checkGroupHasLecturer(
                registerPitching.group.id,
              );
            lecturers.forEach(async (lecturer) => {
              const createNotificationToLecturerDto: CreateNotificationDto =
                new CreateNotificationDto(
                  NotificationTypeEnum.DELETE_PROJECT,
                  `${project.business.fullname} đã xóa dự án ${project.name_project} mà nhóm đã đăng ký pitching`,
                  this.configService.get('MAIL_USER'),
                  lecturer.user.email,
                );
              await this.notificationService.createNotification(
                createNotificationToLecturerDto,
              );
            });
          });
          const deleteRegisterPitching =
            await this.registerPitchingRepository.remove(
              checkProjectHaveRegisterPitching,
            );
          if (!deleteRegisterPitching) {
            throw new InternalServerErrorException(
              'Có lỗi xảy ra khi xóa đăng ký pitching',
            );
          }
        }
      }
      const result = await this.projectRepository.remove(project);
      if (!result) {
        throw new InternalServerErrorException('Có lỗi xảy ra khi xóa dự án');
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
      Object.assign(project, updateProjectDto, {
        responsible_person: responsiblePerson,
      });
      project.project_status = ProjectStatusEnum.PENDING
        ? ProjectStatusEnum.PUBLIC
        : project.project_status;
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
    if (project.is_first_project) {
      project.is_first_project = false;
      try {
        const business = await this.userRepository.findOne({
          where: { email: project.business.email },
        });
        business.isConfirmByAdmin = true;
        const result: User = await this.userRepository.save(business);
        if (!result) {
          throw new InternalServerErrorException(
            'Có lỗi khi phê duyệt doanh nghiệp',
          );
        }
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    }
    project.project_status = ProjectStatusEnum.PUBLIC;
    try {
      const result: Project = await this.projectRepository.save(project);
      if (!result) {
        throw new InternalServerErrorException('Có lỗi khi phê duyệt dự án');
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
    if (project.is_first_project) {
      throw new BadRequestException('Dự án chưa được phê duyệt bởi admin');
    }
    //Business Update Project Status To Processing------------------------------------
    if (
      projectStatus === ProjectStatusEnum.PROCESSING &&
      project.project_status == ProjectStatusEnum.PUBLIC
    ) {
      project.project_status = projectStatus;
      const currentDate: string = moment().format('DD/MM/YYYY');
      project.project_actual_start_date = currentDate;
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
      const currentDate: string = moment().format('DD/MM/YYYY');
      project.project_actual_end_date = currentDate;
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

  async statisticsProjectByBusinessType(): Promise<
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
        'Lên ý tưởng': 0,
        'Triển khai thực tế': 0,
      };

      dataProject.forEach((project: Project) => {
        const business_type = project.business_type;
        if (business_type) {
          tmpCountData[business_type] = tmpCountData[business_type] + 1;
        }
      });

      const result: { key: string; value: number }[] = Object.keys(
        tmpCountData,
      ).map((key) => ({ key, value: tmpCountData[key] }));
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi thống kê dự án theo loại doanh nghiệp',
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

  extractProjectDates = (inputString: string): any | null => {
    const regex = /Từ (\d{1,2}\/\d{4}) tới (\d{1,2}\/\d{4})/;
    const match = inputString.match(regex);

    if (match) {
      const [, startDate, endDate] = match;
      return {
        project_start_date: startDate,
        project_expected_end_date: endDate,
      };
    } else {
      return null;
    }
  };

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleExpectedEndDate() {
    const projects = await this.projectRepository.find({
      where: { is_extent: true },
    });
    if (projects.length > 0) {
      projects.forEach(async (project) => {
        const parts = this.extractProjectDates(
          project.project_implement_time,
        ).project_expected_end_date.split('/');
        const month = parseInt(parts[0], 10);
        const year = parseInt(parts[1], 10);
        const currentDate = new Date();
        const projectImplementTime = new Date(year, month - 1);
        if (currentDate >= projectImplementTime) {
          switch (month) {
            case 4: {
              project.project_implement_time = `Học kì Hè ${year} (Từ 5/${year} tới 8/${year})`;
              project.project_start_date = `5/${year}`;
              project.project_expected_end_date = `8/${year}`;
              project.is_extent = false;
              await this.projectRepository.save(project);
              break;
            }
            case 8: {
              project.project_implement_time = `Học kì Thu ${year} (Từ 9/${year} tới 12/${year})`;
              project.project_start_date = `9/${year}`;
              project.project_expected_end_date = `12/${year}`;
              project.is_extent = false;
              await this.projectRepository.save(project);
              break;
            }
            case 12: {
              project.project_implement_time = `Học kì Xuân ${year + 1} (Từ 1/${
                year + 1
              } tới 4/${year + 1})`;
              project.project_start_date = `1/${year + 1}`;
              project.project_expected_end_date = `4/${year + 1}`;
              project.is_extent = false;
              await this.projectRepository.save(project);
              break;
            }
          }
        }
      });
    }
  }
}
