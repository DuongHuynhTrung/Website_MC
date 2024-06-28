import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProject } from './entities/user-project.entity';
import { Repository } from 'typeorm';
import { CreateUserProjectDto } from './dto/create-user-project.dto';
import { User } from 'src/user/entities/user.entity';
import { RoleEnum } from 'src/role/enum/role.enum';
import { UserProjectStatusEnum } from './enum/user-project-status.enum';

@Injectable()
export class UserProjectService {
  constructor(
    @InjectRepository(UserProject)
    private readonly userProjectRepository: Repository<UserProject>,
  ) {}

  async createUserProject(
    createUserProjectDto: CreateUserProjectDto,
  ): Promise<UserProject> {
    const user_project =
      this.userProjectRepository.create(createUserProjectDto);
    if (!user_project) {
      throw new BadRequestException('Có lỗi xảy ra khi tạo user_project');
    }
    try {
      const result = await this.userProjectRepository.save(user_project);
      if (!result) {
        throw new InternalServerErrorException(
          'Something went wrong when saving user_project',
        );
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async saveUserProject(UserProject: UserProject): Promise<void> {
    try {
      await this.userProjectRepository.save(UserProject);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi lưu user-project bằng hàm',
      );
    }
  }

  async findUserProjectById(id: number): Promise<UserProject> {
    try {
      const user_project = await this.userProjectRepository.findOne({
        where: {
          id,
        },
        relations: ['user', 'project'],
      });

      if (!user_project) {
        throw new NotFoundException(`Không tìm thấy user_project với id ${id}`);
      }
      return user_project;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findAllUserProjectByUserId(user: User): Promise<UserProject[]> {
    try {
      const userId = user.id;
      const user_project: UserProject[] = await this.userProjectRepository
        .createQueryBuilder('user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .leftJoinAndSelect('user_project.project', 'project')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.id = :userId', { userId })
        .getMany();
      if (!user_project) {
        throw new NotFoundException(
          `Không tìm thấy user_project với user id ${user.id}`,
        );
      }
      return user_project;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findAllUserProjectByProjectId(
    projectId: number,
  ): Promise<UserProject[]> {
    try {
      const UserProject: UserProject[] = await this.userProjectRepository
        .createQueryBuilder('user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .leftJoinAndSelect('user_project.project', 'project')
        .leftJoinAndSelect('user.role', 'role')
        .where('project.id = :projectId', { projectId })
        .getMany();
      if (!UserProject) {
        throw new NotFoundException(`Dự án với id ${projectId} không tồn tại`);
      }
      return UserProject;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async checkUserInProject(
    userId: number,
    projectId: number,
  ): Promise<UserProject> {
    try {
      const userProject: UserProject = await this.userProjectRepository
        .createQueryBuilder('user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .leftJoinAndSelect('userProject.project', 'project')
        .where('user.id = :userId', { userId })
        .andWhere('project.id = :projectId', { projectId })
        .getOne();
      if (!userProject) {
        return null;
      }
      return userProject;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async checkUserInProjectByEmail(
    email: string,
    projectId: number,
  ): Promise<UserProject> {
    try {
      const user_project: UserProject[] = await this.userProjectRepository.find(
        {
          relations: ['user', 'project'],
        },
      );
      if (user_project.length === 0) {
        throw new NotFoundException('Hệ thống hiện chưa có dự án nào');
      }
      const UserProject = user_project.find(
        (user_project) =>
          user_project.project.id == projectId &&
          user_project.user.email == email,
      );
      return UserProject;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getResponsibleOfProject(projectId: number): Promise<UserProject[]> {
    try {
      const UserProject: UserProject[] = await this.userProjectRepository
        .createQueryBuilder('user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .leftJoinAndSelect('user_project.project', 'project')
        .leftJoinAndSelect('user.role', 'role')
        .where('project.id = :projectId', { projectId })
        .andWhere('user.role.roleName = :roleName', {
          roleName: RoleEnum.RESPONSIBLE_PERSON,
        })
        .getMany();
      if (!UserProject) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi truy xuất thông tin trưởng nhóm để chọn',
        );
      }
      return UserProject;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getBusinessOfProject(projectId: number): Promise<UserProject> {
    try {
      const UserProject: UserProject = await this.userProjectRepository
        .createQueryBuilder('user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .leftJoinAndSelect('user_project.project', 'project')
        .where('project.id = :projectId', { projectId })
        .andWhere('user_project.user_project_status = :user_project_status', {
          user_project_status: UserProjectStatusEnum.OWNER,
        })
        .getOne();
      if (!UserProject) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi truy xuất thông tin trưởng nhóm để chọn',
        );
      }
      return UserProject;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getProjectOfBusiness(businessId: number): Promise<UserProject[]> {
    try {
      const UserProject: UserProject[] = await this.userProjectRepository
        .createQueryBuilder('user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .leftJoinAndSelect('user_project.project', 'project')
        .where('user.id = :businessId', { businessId })
        .getMany();
      if (!UserProject) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi truy xuất thông tin trưởng nhóm để chọn',
        );
      }
      return UserProject;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeAllUserProjectByProjectId(projectId: number): Promise<void> {
    try {
      const userProjects: UserProject[] = await this.userProjectRepository
        .createQueryBuilder('user_project')
        .leftJoinAndSelect('user_project.project', 'project')
        .where('project.id = :projectId', { projectId })
        .getMany();
      await this.userProjectRepository.remove(userProjects);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeUserFromProject(
    projectId: number,
    userId: number,
  ): Promise<UserProject> {
    try {
      const userProject: UserProject = await this.userProjectRepository
        .createQueryBuilder('user_project')
        .leftJoinAndSelect('user_project.user', 'user')
        .leftJoinAndSelect('user_project.project', 'project')
        .where('project.id = :projectId', { projectId })
        .andWhere('user.id = :userId', { userId })
        .getOne();
      const result: UserProject =
        await this.userProjectRepository.remove(userProject);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi xóa người dùng khỏi dự án',
        );
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
