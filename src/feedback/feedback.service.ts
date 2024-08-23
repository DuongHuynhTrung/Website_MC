import { NotificationService } from 'src/notification/notification.service';
import { UserProjectService } from './../user-project/user-project.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from 'src/project/entities/project.entity';
import { ProjectStatusEnum } from 'src/project/enum/project-status.enum';
import { UserProject } from 'src/user-project/entities/user-project.entity';
import { User } from 'src/user/entities/user.entity';
import { UserProjectStatusEnum } from 'src/user-project/enum/user-project-status.enum';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingStatusEnum } from 'src/register-pitching/enum/register-pitching.enum';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { NotificationTypeEnum } from 'src/notification/enum/notification-type.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    private readonly userGroupService: UserGroupService,

    private readonly userProjectService: UserProjectService,

    private readonly notificationService: NotificationService,

    private readonly configService: ConfigService,
  ) {}

  async createFeedback(
    createFeedbackDto: CreateFeedbackDto,
    user: User,
  ): Promise<Feedback> {
    const project: Project = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.register_pitchings', 'register_pitchings')
      .leftJoinAndSelect('register_pitchings.group', 'group')
      .where('project.id = :projectId', {
        projectId: createFeedbackDto.projectId,
      })
      .getOne();
    if (!project) {
      throw new NotFoundException('Không tìm thấy dự án');
    }
    if (project.project_status !== ProjectStatusEnum.PROCESSING) {
      throw new BadRequestException(
        'Chỉ dự án đang triển khai có thể tạo đánh giá',
      );
    }
    const checkUserInProject: UserProject =
      await this.userProjectService.checkUserInProject(user.id, project.id);
    if (!checkUserInProject) {
      throw new NotFoundException('Người dùng không thuộc dự án');
    }
    if (
      checkUserInProject.user_project_status != UserProjectStatusEnum.OWNER &&
      checkUserInProject.user_project_status != UserProjectStatusEnum.EDIT
    ) {
      throw new ForbiddenException(
        'Chỉ có doanh nghiệp và người phụ trách được cấp quyền có thể tạo đánh giá',
      );
    }
    const checkProjectExistFeedback: boolean =
      await this.checkProjectExistFeedback(project.id);
    if (checkProjectExistFeedback) {
      throw new BadRequestException(
        'Dự án đã có đánh giá. Không thể tạo thêm!',
      );
    }
    const feedback: Feedback =
      this.feedbackRepository.create(createFeedbackDto);
    if (!feedback) {
      throw new BadRequestException('Có lỗi xảy ra khi tạo đánh giá');
    }
    feedback.project = project;

    try {
      // Send notification
      const registerPitching: RegisterPitching =
        project.register_pitchings.find(
          (registerPitching) =>
            registerPitching.register_pitching_status ==
            RegisterPitchingStatusEnum.SELECTED,
        );
      // Send notification to leader
      const leaderOfGroup: UserGroup =
        await this.userGroupService.getLeaderOfGroup(registerPitching.group.id);
      const notificationLeaderDto: CreateNotificationDto =
        new CreateNotificationDto(
          NotificationTypeEnum.BUSINESS_CREATE_FEEDBACK,
          `Doanh nghiệp đã thêm một đánh giá mới vào dự án ${project.name_project} bạn đang tham gia`,
          this.configService.get('MAIL_USER'),
          leaderOfGroup.user.email,
        );
      await this.notificationService.createNotification(notificationLeaderDto);

      // Send notification to lecturer
      const lecturerOfGroup: UserGroup[] =
        await this.userGroupService.checkGroupHasLecturer(
          registerPitching.group.id,
        );
      lecturerOfGroup.forEach(async (lecturer) => {
        const createNotificationDtoLecturer: CreateNotificationDto =
          new CreateNotificationDto(
            NotificationTypeEnum.BUSINESS_CREATE_FEEDBACK,
            `Doanh nghiệp đã thêm một đánh giá mới vào dự án ${project.name_project} bạn đang tham gia`,
            this.configService.get('MAIL_USER'),
            lecturer.user.email,
          );
        await this.notificationService.createNotification(
          createNotificationDtoLecturer,
        );
      });
    } catch (error) {
      throw new InternalServerErrorException('Có lỗi xảy ra khi gửi thông báo');
    }

    try {
      const result: Feedback = await this.feedbackRepository.save(feedback);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi lưu đánh giá',
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return feedback;
  }

  async checkProjectExistFeedback(projectId: number): Promise<boolean> {
    try {
      const checkExist: Feedback = await this.feedbackRepository
        .createQueryBuilder('feedback')
        .leftJoinAndSelect('feedback.project', 'project')
        .where('project.id = :projectId', { projectId })
        .getOne();
      if (checkExist) {
        return true;
      }
      return false;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getFeedbacks(): Promise<Feedback[]> {
    try {
      const feedbacks: Feedback[] = await this.feedbackRepository.find({
        relations: ['project'],
      });
      if (!feedbacks) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi truy xuất tất cả đánh giá',
        );
      }
      return feedbacks;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getFeedbackByProjectId(projectId: number): Promise<Feedback> {
    try {
      const feedback: Feedback = await this.feedbackRepository
        .createQueryBuilder('feedback')
        .leftJoinAndSelect('feedback.project', 'project')
        .where('project.id = :projectId', { projectId })
        .getOne();
      if (!feedback) {
        throw new NotFoundException('Không tìm thấy đánh giá');
      }
      return feedback;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getFeedbackById(id: number): Promise<Feedback> {
    try {
      const feedback: Feedback = await this.feedbackRepository.findOne({
        where: { id },
        relations: ['project'],
      });
      if (!feedback) {
        throw new NotFoundException('Không tìm thấy đánh giá');
      }
      return feedback;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateFeedback(
    id: number,
    updateFeedbackDto: UpdateFeedbackDto,
    user: User,
  ): Promise<Feedback> {
    const feedback: Feedback = await this.getFeedbackById(id);
    const checkUserInProject: UserProject =
      await this.userProjectService.checkUserInProject(
        user.id,
        feedback.project.id,
      );
    if (!checkUserInProject) {
      throw new NotFoundException('Người dùng không thuộc dự án');
    }
    if (
      checkUserInProject.user_project_status != UserProjectStatusEnum.OWNER &&
      checkUserInProject.user_project_status != UserProjectStatusEnum.EDIT
    ) {
      throw new ForbiddenException(
        'Chỉ có doanh nghiệp và người phụ trách được cấp quyền có thể chỉnh sửa đánh giá',
      );
    }
    try {
      const project: Project = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.register_pitchings', 'register_pitchings')
        .leftJoinAndSelect('register_pitchings.group', 'group')
        .where('project.id = :projectId', {
          projectId: feedback.project.id,
        })
        .getOne();
      if (!project) {
        throw new NotFoundException('Không tìm thấy dự án');
      }
      if (project.project_status !== ProjectStatusEnum.PROCESSING) {
        throw new BadRequestException(
          'Chỉ dự án đang triển khai có thể chỉnh sửa đánh giá',
        );
      }

      Object.assign(feedback, updateFeedbackDto);
      await this.feedbackRepository.save(feedback);

      // Send notification
      const registerPitching: RegisterPitching =
        project.register_pitchings.find(
          (registerPitching) =>
            registerPitching.register_pitching_status ==
            RegisterPitchingStatusEnum.SELECTED,
        );
      // Send notification to leader
      const leaderOfGroup: UserGroup =
        await this.userGroupService.getLeaderOfGroup(registerPitching.group.id);
      const notificationLeaderDto: CreateNotificationDto =
        new CreateNotificationDto(
          NotificationTypeEnum.BUSINESS_UPDATE_FEEDBACK,
          `Doanh nghiệp đã chỉnh sửa đánh giá của dự án ${project.name_project} bạn đang tham gia`,
          this.configService.get('MAIL_USER'),
          leaderOfGroup.user.email,
        );
      await this.notificationService.createNotification(notificationLeaderDto);

      // Send notification to lecturer
      const lecturerOfGroup: UserGroup[] =
        await this.userGroupService.checkGroupHasLecturer(
          registerPitching.group.id,
        );
      lecturerOfGroup.forEach(async (lecturer) => {
        const createNotificationDtoLecturer: CreateNotificationDto =
          new CreateNotificationDto(
            NotificationTypeEnum.BUSINESS_UPDATE_FEEDBACK,
            `Doanh nghiệp đã chỉnh sửa đánh giá của dự án ${project.name_project} bạn đang tham gia`,
            this.configService.get('MAIL_USER'),
            lecturer.user.email,
          );
        await this.notificationService.createNotification(
          createNotificationDtoLecturer,
        );
      });

      return feedback;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi thay đổi thông tin đánh giá',
      );
    }
  }

  async deleteFeedback(id: number): Promise<Feedback> {
    const feedback: Feedback = await this.getFeedbackById(id);
    await this.feedbackRepository.remove(feedback);
    return feedback;
  }
}
