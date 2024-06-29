import { User } from './../user/entities/user.entity';
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Repository, DataSource } from 'typeorm';
import { Project } from './entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
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
import { UserProjectService } from 'src/user-project/user-project.service';
import { CreateUserProjectDto } from 'src/user-project/dto/create-user-project.dto';
import { UserProjectStatusEnum } from 'src/user-project/enum/user-project-status.enum';
import { UserProject } from 'src/user-project/entities/user-project.entity';
import { CreateProjectWithTokenDto } from './dto/create-project-with-token.dto';
import { CreateProjectWithoutTokenDto } from './dto/create-project-without-token.dto';
import { RoleService } from 'src/role/role.service';
import { Role } from 'src/role/entities/role.entity';
import { MyFunctions } from 'src/utils/MyFunctions';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RegisterPitching)
    private readonly registerPitchingRepository: Repository<RegisterPitching>,

    private readonly groupService: GroupService,

    private readonly userGroupService: UserGroupService,

    private readonly notificationService: NotificationService,

    private readonly configService: ConfigService,

    private readonly userProjectService: UserProjectService,

    private readonly roleService: RoleService,

    private readonly emailService: EmailService,

    private readonly dataSource: DataSource,
  ) {}

  async createProject(createProjectDto: CreateProjectDto): Promise<Project> {
    const responsiblePerson = await this.userRepository.findOne({
      where: { email: createProjectDto.email_responsible_person },
    });
    if (!responsiblePerson) {
      throw new NotFoundException(
        `Không tìm thấy người phụ trách với email ${createProjectDto.email_responsible_person}`,
      );
    }

    if (responsiblePerson.role_name != RoleEnum.RESPONSIBLE_PERSON) {
      throw new BadRequestException(
        `Email đã tồn tại trong hệ thống với vai trò không phải người phụ trách. Vui lòng liên hệ với Admin để giải quyết`,
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
    try {
      const result = await this.projectRepository.save(project);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi khi tạo dự án. Vui lòng kiểm tra lại thông tin!',
        );
      }

      // Add responsible person to project
      const createUserProjectResponsibleDto = new CreateUserProjectDto({
        project: result,
        user: responsiblePerson,
        user_project_status: UserProjectStatusEnum.VIEW,
      });
      await this.userProjectService.createUserProject(
        createUserProjectResponsibleDto,
      );

      // Add business to project
      const createUserProjectBusinessDto = new CreateUserProjectDto({
        project: result,
        user: business,
        user_project_status: UserProjectStatusEnum.OWNER,
      });
      await this.userProjectService.createUserProject(
        createUserProjectBusinessDto,
      );

      await this.handleGetProjects();
      await this.handleGetProjectsOfBusiness(business);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createProjectWithToken(
    createProjectWithTokenDto: CreateProjectWithTokenDto,
    user: User,
  ): Promise<Project> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let business: User = await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.email = :email', {
          email: createProjectWithTokenDto.businessEmail,
        })
        .andWhere('role.role_name = :role_name', {
          role_name: RoleEnum.BUSINESS,
        })
        .getOne();

      if (business && createProjectWithTokenDto.is_change_business_info) {
        business.fullname = createProjectWithTokenDto.fullname;
        business.business_sector = createProjectWithTokenDto.business_sector;
        business.business_description =
          createProjectWithTokenDto.business_description;
        business.address = createProjectWithTokenDto.address;
        business.address_detail = createProjectWithTokenDto.address_detail;

        await queryRunner.manager.save(business);
      } else if (!business) {
        const role: Role = await this.roleService.getRoleByRoleName(
          RoleEnum.BUSINESS,
        );
        const passwordGenerated = await MyFunctions.generatePassword(12);
        business = this.userRepository.create({
          fullname: createProjectWithTokenDto.businessName,
          email: createProjectWithTokenDto.businessEmail,
          business_sector: createProjectWithTokenDto.business_sector,
          business_description: createProjectWithTokenDto.business_description,
          address: createProjectWithTokenDto.address,
          address_detail: createProjectWithTokenDto.address_detail,
          link_web: createProjectWithTokenDto?.link_web,
          role: role,
          role_name: RoleEnum.BUSINESS,
          password: passwordGenerated.passwordEncoded,
          status: true,
          isConfirmByAdmin: true,
        });

        await queryRunner.manager.save(business);

        await this.emailService.provideAccount(
          business.email,
          business.fullname,
          passwordGenerated.password,
        );
      }

      let responsiblePerson: User = await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.email = :email', {
          email: createProjectWithTokenDto.email_responsible_person,
        })
        .andWhere('role.role_name = :role_name', {
          role_name: RoleEnum.RESPONSIBLE_PERSON,
        })
        .getOne();

      if (
        responsiblePerson &&
        createProjectWithTokenDto.is_change_responsible_info
      ) {
        responsiblePerson.fullname = createProjectWithTokenDto.fullname;
        responsiblePerson.phone_number = createProjectWithTokenDto.phone_number;
        responsiblePerson.position = createProjectWithTokenDto.position;

        await queryRunner.manager.save(responsiblePerson);
      } else if (!responsiblePerson) {
        const role: Role = await this.roleService.getRoleByRoleName(
          RoleEnum.RESPONSIBLE_PERSON,
        );
        responsiblePerson = this.userRepository.create({
          fullname: createProjectWithTokenDto.fullname,
          phone_number: createProjectWithTokenDto.phone_number,
          position: createProjectWithTokenDto.position,
          email: createProjectWithTokenDto.email_responsible_person,
          other_contact: createProjectWithTokenDto?.other_contact,
          role: role,
          role_name: RoleEnum.RESPONSIBLE_PERSON,
        });

        await queryRunner.manager.save(responsiblePerson);
      }

      const project: Project = new Project(
        createProjectWithTokenDto.name_project,
        createProjectWithTokenDto.business_type,
        createProjectWithTokenDto.purpose,
        createProjectWithTokenDto.target_object,
        createProjectWithTokenDto.request,
        createProjectWithTokenDto.project_start_date,
        createProjectWithTokenDto.project_expected_end_date,
        createProjectWithTokenDto.project_implement_time,
        createProjectWithTokenDto.expected_budget,
        createProjectWithTokenDto?.note,
        createProjectWithTokenDto?.document_related_link,
        createProjectWithTokenDto.is_extent,
        false,
      );

      if (
        user.role_name == RoleEnum.ADMIN &&
        createProjectWithTokenDto.is_created_by_admin
      ) {
        project.project_status = ProjectStatusEnum.PUBLIC;
      }

      await queryRunner.manager.save(project);

      const businessProjectDto: CreateUserProjectDto = new CreateUserProjectDto(
        {
          project: project,
          user: business,
          user_project_status: UserProjectStatusEnum.OWNER,
        },
      );
      await this.userProjectService.createUserProject(
        businessProjectDto,
        queryRunner.manager,
      );

      const responsibleProjectDto: CreateUserProjectDto =
        new CreateUserProjectDto({
          project: project,
          user: responsiblePerson,
          user_project_status: UserProjectStatusEnum.VIEW,
        });
      await this.userProjectService.createUserProject(
        responsibleProjectDto,
        queryRunner.manager,
      );

      await this.handleGetProjects();
      await this.handleGetProjectsOfBusiness(business);

      await queryRunner.commitTransaction();

      return project;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async createProjectWithoutToken(
    createProjectWithoutTokenDto: CreateProjectWithoutTokenDto,
  ): Promise<Project> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const roleBusiness: Role = await this.roleService.getRoleByRoleName(
        RoleEnum.BUSINESS,
      );
      const business = this.userRepository.create({
        fullname: createProjectWithoutTokenDto.businessName,
        email: createProjectWithoutTokenDto.businessEmail,
        business_sector: createProjectWithoutTokenDto.business_sector,
        business_description: createProjectWithoutTokenDto.business_description,
        address: createProjectWithoutTokenDto.address,
        address_detail: createProjectWithoutTokenDto.address_detail,
        link_web: createProjectWithoutTokenDto?.link_web,
        role: roleBusiness,
        role_name: RoleEnum.BUSINESS,
        status: false,
        isConfirmByAdmin: false,
      });
      await queryRunner.manager.save(business);

      const roleResponsible: Role = await this.roleService.getRoleByRoleName(
        RoleEnum.RESPONSIBLE_PERSON,
      );
      const responsiblePerson = this.userRepository.create({
        fullname: createProjectWithoutTokenDto.fullname,
        phone_number: createProjectWithoutTokenDto.phone_number,
        position: createProjectWithoutTokenDto.position,
        email: createProjectWithoutTokenDto.email_responsible_person,
        other_contact: createProjectWithoutTokenDto?.other_contact,
        role: roleResponsible,
        role_name: RoleEnum.RESPONSIBLE_PERSON,
      });
      await queryRunner.manager.save(responsiblePerson);

      const project: Project = new Project(
        createProjectWithoutTokenDto.name_project,
        createProjectWithoutTokenDto.business_type,
        createProjectWithoutTokenDto.purpose,
        createProjectWithoutTokenDto.target_object,
        createProjectWithoutTokenDto.request,
        createProjectWithoutTokenDto.project_start_date,
        createProjectWithoutTokenDto.project_expected_end_date,
        createProjectWithoutTokenDto.project_implement_time,
        createProjectWithoutTokenDto.expected_budget,
        createProjectWithoutTokenDto?.note,
        createProjectWithoutTokenDto?.document_related_link,
        createProjectWithoutTokenDto.is_extent,
        true,
      );
      await queryRunner.manager.save(project);

      const businessProjectDto: CreateUserProjectDto = new CreateUserProjectDto(
        {
          project: project,
          user: business,
          user_project_status: UserProjectStatusEnum.OWNER,
        },
      );
      await this.userProjectService.createUserProject(
        businessProjectDto,
        queryRunner.manager,
      );

      const responsibleProjectDto: CreateUserProjectDto =
        new CreateUserProjectDto({
          project: project,
          user: responsiblePerson,
          user_project_status: UserProjectStatusEnum.VIEW,
        });
      await this.userProjectService.createUserProject(
        responsibleProjectDto,
        queryRunner.manager,
      );

      await this.handleGetProjects();
      await this.handleGetProjectsOfBusiness(business);

      await queryRunner.commitTransaction();
      return project;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getAllFirstProject(): Promise<Project[]> {
    try {
      const projects: Project[] = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.user_projects', 'user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .where('project.is_first_project = true')
        .orderBy('project.createdAt', 'DESC')
        .getMany();

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

  async getProjectsForAdmin(): Promise<[{ totalProjects: number }, Project[]]> {
    try {
      const projects: Project[] = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.user_projects', 'user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .orderBy('project.createdAt', 'DESC')
        .getMany();
      if (!projects || projects.length === 0) {
        return [{ totalProjects: 0 }, []];
      }
      const totalProjects = projects.length;
      await this.handleGetProjects();
      return [{ totalProjects }, projects];
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getProjects(): Promise<[{ totalProjects: number }, Project[]]> {
    try {
      let projects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.user_projects', 'user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .where('project.is_first_project = false')
        .andWhere('project.project_status = :status', {
          status: ProjectStatusEnum.PUBLIC,
        })
        .orderBy('project.createdAt', 'DESC')
        .getMany();

      if (!projects || projects.length === 0) {
        return [{ totalProjects: 0 }, []];
      }
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
      let projects: Project[] = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.user_projects', 'user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .where('user.id = :businessId', {
          businessId: business.id,
        })
        .orderBy('project.createdAt', 'DESC')
        .getMany();
      if (!projects || projects.length === 0) {
        return [];
      }
      const projectIds: number[] = projects.map((project) => project.id);

      projects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.user_projects', 'user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .where('project.id IN (:...projectIds)', { projectIds: projectIds })
        .orderBy('project.createdAt', 'DESC')
        .getMany();

      await this.handleGetProjectsOfBusiness(business);
      return projects;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi truy xuất tất cả dự án của doanh nghiệp',
      );
    }
  }

  async getProjectsOfResponsiblePerson(
    responsiblePerson: User,
  ): Promise<Project[]> {
    try {
      let projects: Project[] = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.user_projects', 'user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .where('user.id = :responsible_person_id', {
          responsible_person_id: responsiblePerson.id,
        })
        .orderBy('project.createdAt', 'DESC')
        .getMany();
      if (!projects || projects.length === 0) {
        return [];
      }
      const projectIds: number[] = projects.map((project) => project.id);

      projects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.user_projects', 'user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .where('project.id IN (:...projectIds)', { projectIds: projectIds })
        .orderBy('project.createdAt', 'DESC')
        .getMany();

      return projects;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi truy xuất tất cả dự án của người phụ trách',
      );
    }
  }

  async getProjectById(id: number): Promise<Project> {
    try {
      const project: Project = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.user_projects', 'user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .where('project.id = :projectId', { projectId: id })
        .orderBy('project.createdAt', 'DESC')
        .getOne();

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
          const businessProject: UserProject =
            await this.userProjectService.getBusinessOfProject(project.id);
          checkProjectHaveRegisterPitching.forEach(async (registerPitching) => {
            await this.groupService.changeGroupStatusToFree(
              registerPitching.group.id,
            );
            //Send mail to Leader of group
            const leader: UserGroup =
              await this.userGroupService.getLeaderOfGroup(
                registerPitching.group.id,
              );
            const createNotificationToLeaderDto: CreateNotificationDto =
              new CreateNotificationDto(
                NotificationTypeEnum.DELETE_PROJECT,
                `${businessProject.user.fullname} đã xóa dự án ${project.name_project} mà nhóm đã đăng ký pitching`,
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
                  `${businessProject.user.fullname} đã xóa dự án ${project.name_project} mà nhóm đã đăng ký pitching`,
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
      await this.userProjectService.removeAllUserProjectByProjectId(project.id);
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

    try {
      Object.assign(project, updateProjectDto);
      project.project_status =
        project.project_status == ProjectStatusEnum.PENDING
          ? ProjectStatusEnum.PUBLIC
          : project.project_status;
      await this.projectRepository.save(project);

      const businessProject: UserProject =
        await this.userProjectService.getBusinessOfProject(project.id);

      await this.handleGetProjects();
      await this.handleGetProjectsOfBusiness(businessProject.user);
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
    const business = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.user_projects', 'user_project')
      .leftJoinAndSelect('user_project.project', 'project')
      .where('project.id = :projectId', { projectId: project.id })
      .getOne();
    if (project.is_first_project) {
      project.is_first_project = false;
      try {
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
      await this.handleGetProjectsOfBusiness(business);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changeProjectStatus(
    projectId: number,
    projectStatus: ProjectStatusEnum,
    groupId: number,
    user: User,
  ): Promise<Project> {
    const project: Project = await this.getProjectById(projectId);

    if (user.role.role_name != RoleEnum.LECTURER) {
      const checkUserInProject: UserProject =
        await this.userProjectService.checkUserInProject(user.id, projectId);
      if (
        checkUserInProject.user_project_status != UserProjectStatusEnum.OWNER &&
        checkUserInProject.user_project_status != UserProjectStatusEnum.EDIT
      ) {
        throw new ForbiddenException(
          'Chỉ có doanh nghiệp và người phụ trách được cấp quyền có thể thay đổi trạng thái dự án',
        );
      }
    }

    // Business chỉ dùng để handleGetProjectsOfBusiness
    const business: User = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.user_projects', 'user_project')
      .leftJoin('user_project.project', 'project')
      .where('project.id = :projectId', { projectId: project.id })
      .andWhere('user_project.user_project_status = :status', {
        status: UserProjectStatusEnum.OWNER,
      })
      .getOne();
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
        await this.handleGetProjectsOfBusiness(business);
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
        await this.handleGetProjectsOfBusiness(business);
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
      let projects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.user_projects', 'user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .orderBy('project.createdAt', 'DESC')
        .getMany();
      if (!projects || projects.length === 0) {
        SocketGateway.handleGetProjects({
          totalProjects: 0,
          projects: [],
        });
      } else {
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
      let projects: Project[] = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.user_projects', 'user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .where('user.id = :businessId', {
          businessId: business.id,
        })
        .getMany();
      if (!projects || projects.length === 0) {
        SocketGateway.handleGetProjectsOfBusiness({
          totalProjects: 0,
          projects: [],
          emailBusiness: business.email,
        });
      } else {
        const projectIds: number[] = projects.map((project) => project.id);

        projects = await this.projectRepository
          .createQueryBuilder('project')
          .leftJoinAndSelect('project.user_projects', 'user_project')
          .leftJoinAndSelect('user_project.user', 'user')
          .where('project.id IN (:...projectIds)', { projectIds: projectIds })
          .orderBy('project.createdAt', 'DESC')
          .getMany();

        const totalProjects: number = projects.length;
        SocketGateway.handleGetProjectsOfBusiness({
          totalProjects: totalProjects,
          projects: projects,
          emailBusiness: business.email,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi truy xuất tất cả dự án của doanh nghiệp',
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
