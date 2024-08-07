import { CheckBusinessInfoDto } from './dto/check-business-info.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RoleEnum } from '../role/enum/role.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role } from 'src/role/entities/role.entity';
import { UpdateProfileNoAuthDto } from './dto/update-profile-no-auth.dto';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { Project } from 'src/project/entities/project.entity';
import { ProjectStatusEnum } from 'src/project/enum/project-status.enum';
import { RelationshipStatusEnum } from 'src/user-group/enum/relationship-status.enum';
import { Notification } from 'src/notification/entities/notification.entity';
import { CheckResponsibleInfoDto } from './dto/check-responsible-info.dto';
import { UserProjectService } from 'src/user-project/user-project.service';
import { UserProject } from 'src/user-project/entities/user-project.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,

    @InjectRepository(RegisterPitching)
    private readonly registerPitchingRepository: Repository<RegisterPitching>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    private readonly userProjectService: UserProjectService,
  ) {}

  async getUsers(): Promise<[{ totalUsers: number }, User[]]> {
    try {
      let users = await this.userRepository.find({ relations: ['role'] });
      if (!users || users.length === 0) {
        return [{ totalUsers: 0 }, []];
      }
      const admins = await this.userRepository.find({
        where: { role_name: RoleEnum.ADMIN },
      });
      const adminEmail: string[] = admins.map((admin) => admin.email);
      users = users.filter(
        (user) => !adminEmail.includes(user.email) && user.role_name,
      );
      const totalUsers = users.length;
      return [
        { totalUsers },
        users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      ];
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getUserEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });
      if (!user) {
        throw new Error(`Người dùng với email ${email} không tồn tại`);
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });
      if (!user) {
        throw new Error(`Người dùng với email ${email} không tồn tại`);
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async banAccount(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });
      if (!user) {
        throw new Error(`Người dùng với email ${email} không tồn tại`);
      }
      if (user.role_name == RoleEnum.ADMIN) {
        throw new Error('Không thể khóa Admin account');
      }
      user.is_ban = true;
      const result = await this.userRepository.save(user);
      if (!result) {
        throw new Error('Có lỗi xảy ra khi khóa tài khoản người dùng');
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async unBanAccount(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });
      if (!user) {
        throw new Error(`Người dùng với email ${email} không tồn tại`);
      }
      if (user.role_name == RoleEnum.ADMIN) {
        throw new Error('Không thể khóa Admin account');
      }
      if (!user.is_ban) {
        throw new Error('Chỉ có tài khoản đang bị khóa mới cần mở khóa');
      }
      user.is_ban = false;
      const result = await this.userRepository.save(user);
      if (!result) {
        throw new Error('Có lỗi xảy ra khi khóa tài khoản người dùng');
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteAccount(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });
      if (!user) {
        throw new Error(`Người dùng với email ${email} không tồn tại`);
      }
      if (user.role_name == RoleEnum.ADMIN) {
        throw new Error('Không thể xóa Admin account');
      }
      if (!user.is_ban) {
        throw new Error('Chỉ có thể xóa tài khoản đang bị khóa');
      }
      if (user.role == null) {
        const result = await this.userRepository.remove(user);
        if (!result) {
          throw new Error('Có lỗi xảy ra khi xóa tài khoản người dùng');
        }
        return result;
      }
      switch (user.role_name) {
        case RoleEnum.STUDENT: {
          const userId = user.id;
          const user_group: UserGroup[] = await this.userGroupRepository
            .createQueryBuilder('user_group')
            .leftJoinAndSelect('user_group.user', 'user')
            .leftJoinAndSelect('user_group.group', 'group')
            .where('user.id = :userId', { userId })
            .andWhere('user_group.relationship_status = :status', {
              status: RelationshipStatusEnum.JOINED,
            })
            .getMany();
          if (!user_group || user_group.length == 0) {
            const notifications = await this.notificationRepository.find({
              relations: ['sender', 'receiver'],
            });
            const notificationsOfSender = notifications.filter(
              (notification) => notification.sender.id == user.id,
            );
            const notificationsOfReceiver = notifications.filter(
              (notification) => notification.receiver.id == user.id,
            );
            await this.notificationRepository.remove(notificationsOfSender);
            await this.notificationRepository.remove(notificationsOfReceiver);

            const result = await this.userRepository.remove(user);
            if (!result) {
              throw new Error('Có lỗi xảy ra khi xóa tài khoản người dùng');
            }
            return result;
          }
          const groupId: number[] = user_group.map(
            (user_group) => user_group.group.id,
          );
          const registerPitchingsWithGroupId: RegisterPitching[] =
            await this.registerPitchingRepository
              .createQueryBuilder('registerPitching')
              .leftJoinAndSelect('registerPitching.group', 'group')
              .leftJoinAndSelect('registerPitching.project', 'project')
              .where('group.id IN (:...groupId)', { groupId: groupId })
              .andWhere('registerPitching.register_pitching_status = :status', {
                status: 'Selected',
              })
              .getMany();
          if (
            !registerPitchingsWithGroupId ||
            registerPitchingsWithGroupId.length == 0
          ) {
            const notifications = await this.notificationRepository.find({
              relations: ['sender', 'receiver'],
            });
            const notificationsOfSender = notifications.filter(
              (notification) => notification.sender.id == user.id,
            );
            const notificationsOfReceiver = notifications.filter(
              (notification) => notification.receiver.id == user.id,
            );
            await this.notificationRepository.remove(notificationsOfSender);
            await this.notificationRepository.remove(notificationsOfReceiver);

            const userGroups = await this.userGroupRepository.find({
              where: {
                user: { id: userId },
              },
            });
            await this.userGroupRepository.remove(userGroups);

            const result = await this.userRepository.remove(user);
            if (!result) {
              throw new Error('Có lỗi xảy ra khi xóa tài khoản người dùng');
            }
            return result;
          }
          const projectId: number[] = registerPitchingsWithGroupId.map(
            (registerPitching) => registerPitching.project.id,
          );
          const projects = await this.projectRepository
            .createQueryBuilder('project')
            .where('project.id IN (:...projectId)', { projectId: projectId })
            .andWhere('project.project_status = :status', {
              status: ProjectStatusEnum.PROCESSING,
            })
            .getMany();
          if (!projects || projects.length == 0) {
            const notifications = await this.notificationRepository.find({
              relations: ['sender', 'receiver'],
            });
            const notificationsOfSender = notifications.filter(
              (notification) => notification.sender.id == user.id,
            );
            const notificationsOfReceiver = notifications.filter(
              (notification) => notification.receiver.id == user.id,
            );
            await this.notificationRepository.remove(notificationsOfSender);
            await this.notificationRepository.remove(notificationsOfReceiver);

            const userGroups = await this.userGroupRepository.find({
              where: {
                user: { id: userId },
              },
            });
            await this.userGroupRepository.remove(userGroups);

            const result = await this.userRepository.remove(user);
            if (!result) {
              throw new Error('Có lỗi xảy ra khi xóa tài khoản người dùng');
            }
            return result;
          } else {
            throw new Error(
              'Sinh viên vẫn đang trong quá trình thực hiện dự án không thể xóa',
            );
          }
        }
        case RoleEnum.LECTURER: {
          const userId = user.id;
          const user_group: UserGroup[] = await this.userGroupRepository
            .createQueryBuilder('user_group')
            .leftJoinAndSelect('user_group.user', 'user')
            .leftJoinAndSelect('user_group.group', 'group')
            .where('user.id = :userId', { userId })
            .andWhere('user_group.relationship_status = :status', {
              status: RelationshipStatusEnum.JOINED,
            })
            .getMany();
          if (!user_group || user_group.length == 0) {
            const notifications = await this.notificationRepository.find({
              relations: ['sender', 'receiver'],
            });
            const notificationsOfSender = notifications.filter(
              (notification) => notification.sender.id == user.id,
            );
            const notificationsOfReceiver = notifications.filter(
              (notification) => notification.receiver.id == user.id,
            );
            await this.notificationRepository.remove(notificationsOfSender);
            await this.notificationRepository.remove(notificationsOfReceiver);

            const result = await this.userRepository.remove(user);
            if (!result) {
              throw new Error('Có lỗi xảy ra khi xóa tài khoản người dùng');
            }
            return result;
          } else {
            throw new Error(
              'Giảng viên đang tham gia hướng dẫn nhóm không thể xóa!',
            );
          }
        }
        case RoleEnum.BUSINESS: {
          const projects: Project[] = await this.projectRepository
            .createQueryBuilder('project')
            .leftJoinAndSelect('project.user_projects', 'user_project')
            .leftJoinAndSelect('user_project.user', 'user')
            .where('user.id = :businessId', {
              businessId: user.id,
            })
            .getMany();

          if (!projects || projects.length == 0) {
            const notifications = await this.notificationRepository.find({
              relations: ['sender', 'receiver'],
            });
            const notificationsOfSender = notifications.filter(
              (notification) => notification.sender.id == user.id,
            );
            const notificationsOfReceiver = notifications.filter(
              (notification) => notification.receiver.id == user.id,
            );
            await this.notificationRepository.remove(notificationsOfSender);
            await this.notificationRepository.remove(notificationsOfReceiver);

            const result = await this.userRepository.remove(user);
            if (!result) {
              throw new Error('Có lỗi xảy ra khi xóa tài khoản người dùng');
            }
            return result;
          }
          const projectPending = projects.filter(
            (project) => project.project_status == ProjectStatusEnum.PENDING,
          );
          const otherProject = projects.filter(
            (project) => project.project_status != ProjectStatusEnum.PENDING,
          );
          if (otherProject.length > 0) {
            throw new Error(
              'Doanh nghiệp đang hoạt động trong hệ thống. Không thể xóa',
            );
          }

          await this.projectRepository.remove(projectPending);

          const notifications = await this.notificationRepository.find({
            relations: ['sender', 'receiver'],
          });
          const notificationsOfSender = notifications.filter(
            (notification) => notification.sender.id == user.id,
          );
          const notificationsOfReceiver = notifications.filter(
            (notification) => notification.receiver.id == user.id,
          );
          await this.notificationRepository.remove(notificationsOfSender);
          await this.notificationRepository.remove(notificationsOfReceiver);

          const result = await this.userRepository.remove(user);
          if (!result) {
            throw new Error('Có lỗi xảy ra khi xóa tài khoản người dùng');
          }
          return result;
        }
        case RoleEnum.RESPONSIBLE_PERSON: {
          const userProjects: UserProject[] =
            await this.userProjectService.findAllUserProjectByUserId(user);

          if (userProjects && userProjects.length > 0) {
            await this.userProjectService.removeAllUserProjectByUserId(user.id);
          }

          const notifications = await this.notificationRepository.find({
            relations: ['sender', 'receiver'],
          });
          const notificationsOfSender = notifications.filter(
            (notification) => notification.sender.id == user.id,
          );
          const notificationsOfReceiver = notifications.filter(
            (notification) => notification.receiver.id == user.id,
          );
          await this.notificationRepository.remove(notificationsOfSender);
          await this.notificationRepository.remove(notificationsOfReceiver);

          const result = await this.userRepository.remove(user);
          if (!result) {
            throw new Error('Có lỗi xảy ra khi xóa tài khoản người dùng');
          }
          return result;
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async searchUserByEmailString(
    searchEmail: string,
    roleName: RoleEnum,
    leader: User,
  ): Promise<User[]> {
    let users: User[] = [];
    try {
      users = await this.userRepository.find({
        where: {
          email: Like(`%${searchEmail}%`),
        },
        relations: ['role'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Có lỗi xảy ra khi tìm kiếm sinh viên/giảng viên`,
      );
    }
    if (!users || users.length === 0) {
      return [];
    }
    if (roleName === RoleEnum.STUDENT) {
      users = users.filter(
        (user) =>
          user.role.role_name == RoleEnum.STUDENT && user.email != leader.email,
      );
      return users;
    } else if (roleName === RoleEnum.LECTURER) {
      users = users.filter((user) => user.role.role_name == RoleEnum.LECTURER);
      return users;
    } else {
      throw new BadRequestException(
        'Chỉ có thể tìm kiếm sinh viên hoặc giảng viên',
      );
    }
  }

  async searchResponsibleByEmail(searchEmail: string): Promise<User[]> {
    let users: User[] = [];
    try {
      users = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.email LIKE :email', { email: `%${searchEmail}%` })
        .andWhere('role.role_name = :roleName', {
          roleName: RoleEnum.RESPONSIBLE_PERSON,
        })
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `Có lỗi xảy ra khi tìm kiếm người phụ trách`,
      );
    }
    return users;
  }

  async searchUserByEmailForAdmin(
    searchEmail: string,
    roleName: RoleEnum,
  ): Promise<User[]> {
    let users: User[] = [];
    try {
      users = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.email LIKE :email', { email: `%${searchEmail}%` })
        .andWhere('role.role_name = :roleName', {
          roleName,
        })
        .getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `Có lỗi xảy ra khi tìm kiếm người phụ trách`,
      );
    }
    return users;
  }

  async updateProfileNoAuth(
    updateProfileDto: UpdateProfileNoAuthDto,
  ): Promise<User> {
    try {
      if (updateProfileDto.role_name == RoleEnum.ADMIN) {
        throw new Error('Không thể cập nhật vai trò thành admin');
      }
      const user = await this.userRepository.findOneBy({
        email: updateProfileDto.email,
      });
      if (!user) {
        throw new Error(
          `Người dùng với email ${updateProfileDto.email} không tồn tại`,
        );
      }
      Object.assign(user, updateProfileDto);
      if (updateProfileDto.role_name == RoleEnum.BUSINESS) {
        user.isConfirmByAdmin = false;
      }
      if (updateProfileDto.role_name) {
        const role = await this.roleRepository.findOne({
          where: { role_name: updateProfileDto.role_name },
        });
        if (role) {
          user.role = role;
        }
      }
      await this.userRepository.save(user);
      return await this.getUserByEmail(user.email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    user: User,
  ): Promise<User> {
    try {
      if (updateProfileDto.role_name == RoleEnum.ADMIN) {
        throw new Error('Không thể cập nhật vai trò thành admin');
      }
      Object.assign(user, updateProfileDto);
      if (updateProfileDto.role_name == RoleEnum.BUSINESS) {
        user.isConfirmByAdmin = false;
      }
      if (updateProfileDto.role_name) {
        const role = await this.roleRepository.findOne({
          where: { role_name: updateProfileDto.role_name },
        });
        if (role) {
          user.role = role;
        }
      }
      await this.userRepository.save(user);
      return await this.getUserByEmail(user.email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async statisticsAccount(): Promise<{ key: string; value: number }[]> {
    try {
      const users: User[] = await this.userRepository.find({
        relations: ['role'],
      });
      if (!users || users.length === 0) {
        return null;
      }
      const tmpCountData: { [key: string]: number } = {};

      users.forEach((user: User) => {
        const role_name = user.role_name;
        if (role_name) {
          if (!isNaN(tmpCountData[role_name])) {
            tmpCountData[role_name] = tmpCountData[role_name] + 1;
          } else {
            tmpCountData[role_name] = 1;
          }
        }
      });

      const result: { key: string; value: number }[] = Object.keys(
        tmpCountData,
      ).map((key) => ({ key, value: tmpCountData[key] }));
      return result.filter(
        (value) => value.key != 'Admin' && value.key != 'Staff',
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi thống kê tài khoản',
      );
    }
  }

  async statisticsAccountByBusinessSector(): Promise<
    { key: string; value: number }[]
  > {
    try {
      const users: User[] = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('role.role_name = :roleName', { roleName: RoleEnum.BUSINESS })
        .getMany();

      if (!users || users.length === 0) {
        return null;
      }
      const tmpCountData: { [key: string]: number } = {
        'Nông nghiệp': 0,
        'Thủ công nghiệp': 0,
        'Du lịch': 0,
        Khác: 0,
      };

      users.forEach((user: User) => {
        const business_sector = user.business_sector;
        if (business_sector) {
          if (Object.keys(tmpCountData).includes(business_sector)) {
            tmpCountData[business_sector] = tmpCountData[business_sector] + 1;
          } else {
            tmpCountData['Khác'] = tmpCountData['Khác'] + 1;
          }
        }
      });

      const result: { key: string; value: number }[] = Object.keys(
        tmpCountData,
      ).map((key) => ({ key, value: tmpCountData[key] }));

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi thống kê tài khoản',
      );
    }
  }

  async statisticsBusinessFollowProvince(): Promise<
    { key: string; value: number }[]
  > {
    try {
      const users: User[] = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('role.role_name = :roleName', { roleName: RoleEnum.BUSINESS })
        .getMany();
      if (!users || users.length == 0) {
        return null;
      }
      const tmpCountData: { [key: string]: number } = {
        'Hà Nội': 0,
        'Hồ Chí Minh': 0,
        'Hải Phòng': 0,
        'Đà Nẵng': 0,
        'Biên Hòa': 0,
        'Nha Trang': 0,
        'Cần Thơ': 0,
        'An Giang': 0,
        'Bà Rịa - Vũng Tàu': 0,
        'Bắc Giang': 0,
        'Bắc Kạn': 0,
        'Bạc Liêu': 0,
        'Bắc Ninh': 0,
        'Bến Tre': 0,
        'Bình Định': 0,
        'Bình Dương': 0,
        'Bình Phước': 0,
        'Bình Thuận': 0,
        'Cao Bằng': 0,
        'Đắk Lắk': 0,
        'Đắk Nông': 0,
        'Đồng Nai': 0,
        'Đồng Tháp': 0,
        'Gia Lai': 0,
        'Hà Giang': 0,
        'Hà Nam': 0,
        'Hà Tĩnh': 0,
        'Hải Dương': 0,
        'Hậu Giang': 0,
        'Hưng Yên': 0,
        'Khánh Hòa': 0,
        'Kiên Giang': 0,
        'Kon Tum': 0,
        'Lai Châu': 0,
        'Lâm Đồng': 0,
        'Lạng Sơn': 0,
        'Lào Cai': 0,
        'Long An': 0,
        'Nam Định': 0,
        'Nghệ An': 0,
        'Ninh Bình': 0,
        'Ninh Thuận': 0,
        'Phú Thọ': 0,
        'Phú Yên': 0,
        'Quảng Bình': 0,
        'Quảng Nam': 0,
        'Quảng Ngãi': 0,
        'Quảng Ninh': 0,
        'Quảng Trị': 0,
        'Sóc Trăng': 0,
        'Sơn La': 0,
        'Tây Ninh': 0,
        'Thái Bình': 0,
        'Thái Nguyên': 0,
        'Thanh Hóa': 0,
        'Thừa Thiên Huế': 0,
        'Tiền Giang': 0,
        'Trà Vinh': 0,
        'Tuyên Quang': 0,
        'Vĩnh Long': 0,
        'Vĩnh Phúc': 0,
        'Yên Bái': 0,
      };

      users.forEach((user: User) => {
        if (user.address) {
          const province = user.address.split(',')[2];
          if (province) {
            Object.keys(tmpCountData).forEach((key) => {
              if (province.includes(key)) {
                tmpCountData[key] = tmpCountData[key] + 1;
              }
            });
          }
        }
      });

      const result: { key: string; value: number }[] = Object.keys(
        tmpCountData,
      ).map((key) => ({ key, value: tmpCountData[key] }));
      return result.sort((a, b) => b.value - a.value);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi thống kê doanh nghiệp theo tỉnh/thành phố',
      );
    }
  }

  async checkBusinessInfo(
    checkBusinessInfoDto: CheckBusinessInfoDto,
  ): Promise<string[]> {
    try {
      const result: string[] = [];
      const business: User = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.email = :email', {
          email: checkBusinessInfoDto.businessEmail,
        })
        .andWhere('role.role_name = :roleName', {
          roleName: RoleEnum.BUSINESS,
        })
        .getOne();
      if (!business) {
        return result;
      }
      if (business.fullname !== checkBusinessInfoDto.businessName) {
        result.push('Tên Doanh nghiệp/Hộ kinh doanh');
      }
      if (
        business.business_description !==
        checkBusinessInfoDto.business_description
      ) {
        result.push('Mô tả ngắn về Doanh nghiệp/Hộ kinh doanh và sản phẩm');
      }
      if (business.business_sector !== checkBusinessInfoDto.business_sector) {
        result.push('Lĩnh vực kinh doanh');
      }
      if (business.address !== checkBusinessInfoDto.address) {
        result.push('Địa chỉ');
      }
      if (business.address_detail !== checkBusinessInfoDto.address_detail) {
        result.push('Địa chỉ cụ thể');
      }

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi kiểm tra thông tin của doanh nghiệp',
      );
    }
  }

  async checkResponsibleInfo(
    checkResponsibleInfoDto: CheckResponsibleInfoDto,
  ): Promise<string[]> {
    try {
      const result: string[] = [];
      const responsible_person: User = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.email = :email', {
          email: checkResponsibleInfoDto.email_responsible_person,
        })
        .andWhere('role.role_name = :roleName', {
          roleName: RoleEnum.RESPONSIBLE_PERSON,
        })
        .getOne();

      if (!responsible_person) {
        return result;
      }

      if (responsible_person.fullname !== checkResponsibleInfoDto.fullname) {
        result.push('Họ và tên');
      }
      if (
        responsible_person.phone_number !== checkResponsibleInfoDto.phone_number
      ) {
        result.push('Số điện thoại');
      }
      if (responsible_person.position !== checkResponsibleInfoDto.position) {
        result.push('Chức vụ');
      }

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi kiểm tra thông tin của người phụ trách',
      );
    }
  }
}
