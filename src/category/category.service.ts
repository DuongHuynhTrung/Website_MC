import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { PhaseService } from 'src/phase/phase.service';
import { UserGroupService } from 'src/user-group/user-group.service';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { Phase } from 'src/phase/entities/phase.entity';
import { CategoryStatusEnum } from './enum/category-status.enum';
import { RoleInGroupEnum } from 'src/user-group/enum/role-in-group.enum';
import { PhaseStatusEnum } from 'src/phase/enum/phase-status.enum';
import { UpdateActualResultDto } from './dto/update-actual-result.dto';
import { SocketGateway } from 'socket.gateway';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    private readonly phaseService: PhaseService,

    private readonly userGroupService: UserGroupService,

    private readonly socketGateway: SocketGateway,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<Category> {
    const user_group: UserGroup = await this.userGroupService.checkUserInGroup(
      user.id,
      createCategoryDto.groupId,
    );
    if (user_group.role_in_group != RoleInGroupEnum.LEADER) {
      throw new ForbiddenException(
        'Chỉ có trưởng nhóm mới có thể tạo hạng mục',
      );
    }
    const phase: Phase = await this.phaseService.getPhaseById(
      createCategoryDto.phaseId,
    );
    if (
      phase.phase_status != PhaseStatusEnum.PENDING &&
      phase.phase_status != PhaseStatusEnum.PROCESSING
    ) {
      throw new BadRequestException(
        'Chỉ có thể tạo hạng mục trước khi giai đoạn hoàn thành',
      );
    }
    const category: Category =
      this.categoryRepository.create(createCategoryDto);
    if (!category) {
      throw new BadRequestException('Có lỗi xảy ra khi tạo Category');
    }
    category.phase = phase;
    try {
      const result: Category = await this.categoryRepository.save(category);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi lưu thông tin hạng mục',
        );
      }
      await this.handleGetCategories(phase.id);
      return await this.getCategoryById(result.id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllCategoryOfPhase(phaseId: number): Promise<Category[]> {
    await this.phaseService.getPhaseById(phaseId);
    try {
      const categories: Category[] = await this.categoryRepository.find({
        relations: ['phase'],
      });
      if (categories.length === 0) {
        return [];
      }
      const result: Category[] = categories.filter(
        (category) => category.phase.id == phaseId,
      );
      await this.handleGetCategories(phaseId);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi truy xuất tất cả hạng mục của giai đoạn',
      );
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      const category: Category = await this.categoryRepository.findOne({
        where: { id },
        relations: ['phase'],
      });
      if (!category) {
        throw new NotFoundException('Không tìm thấy hạng mục');
      }
      return category;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    user: User,
  ): Promise<Category> {
    const user_group: UserGroup = await this.userGroupService.checkUserInGroup(
      user.id,
      updateCategoryDto.groupId,
    );
    if (user_group.role_in_group != RoleInGroupEnum.LEADER) {
      throw new ForbiddenException(
        'Chỉ có trưởng nhóm mới có thể cập nhật thông tin hạng mục',
      );
    }
    const category: Category = await this.getCategoryById(id);
    if (category.category_status != CategoryStatusEnum.TODO) {
      throw new BadRequestException(
        'Chỉ có thể cập nhật thông tin hạng mục khi chưa triển khai',
      );
    }
    category.category_name = updateCategoryDto.category_name;
    category.detail = updateCategoryDto.detail;
    category.result_expected = updateCategoryDto.result_expected;
    try {
      await this.categoryRepository.save(category);
      await this.handleGetCategories(category.phase.id);
      return await this.getCategoryById(id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi cập nhật thông tin của hạng mục',
      );
    }
  }

  async changeCategoryStatus(
    categoryId: number,
    categoryStatus: CategoryStatusEnum,
  ): Promise<Category> {
    const category: Category = await this.getCategoryById(categoryId);
    if (categoryStatus == CategoryStatusEnum.TODO) {
      throw new BadRequestException(
        'Không thể chuyển hạng mục về trạng thái cần làm',
      );
    }
    if (category.category_status == CategoryStatusEnum.DONE) {
      throw new BadRequestException(
        'Hạng mục đã hoàn thành không thể cập nhật trạng thái',
      );
    }
    if (
      categoryStatus == CategoryStatusEnum.DOING &&
      category.phase.phase_status != PhaseStatusEnum.PROCESSING &&
      category.phase.phase_status != PhaseStatusEnum.WARNING
    ) {
      throw new BadRequestException(
        'Chỉ có thể cập nhật trạng thái hạng mục sang đang làm khi giai đoạn đang được triển khai',
      );
    }
    if (
      categoryStatus == CategoryStatusEnum.DOING &&
      category.category_status != CategoryStatusEnum.TODO
    ) {
      throw new BadRequestException(
        'Chỉ có thể cập nhật trạng thái hạng mục từ cần làm sang đang làm',
      );
    }
    if (
      categoryStatus == CategoryStatusEnum.DONE &&
      category.category_status != CategoryStatusEnum.DOING
    ) {
      throw new BadRequestException(
        'Chỉ có thể chuyện trạng thái hạng mục từ đang làm sang hoàn thành',
      );
    }
    if (categoryStatus === CategoryStatusEnum.DONE) {
      category.category_actual_end_date = new Date();
    }
    category.category_status = categoryStatus;
    try {
      const result: Category = await this.categoryRepository.save(category);
      this.socketGateway.handleChangeCategoryStatus({
        category: category,
      });
      return await this.getCategoryById(result.id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi trạng thái của hạng mục',
      );
    }
  }

  async checkPhaseCanBeDone(phaseId: number): Promise<boolean> {
    const categoriesOfPhase: Category[] =
      await this.getAllCategoryOfPhase(phaseId);
    if (categoriesOfPhase.length === 0) {
      throw new NotFoundException('Giai đoạn không có hạng mục nào');
    }
    const isNotDone: Category = categoriesOfPhase.find(
      (category) => category.category_status != CategoryStatusEnum.DONE,
    );
    if (isNotDone) {
      throw new BadRequestException(
        'Giai đoạn tồn tại hạng mục chưa hoàn thành',
      );
    }
    return true;
  }

  async updateActualResult(
    updateActualResultDto: UpdateActualResultDto,
    user: User,
  ): Promise<Category> {
    const user_group: UserGroup = await this.userGroupService.checkUserInGroup(
      user.id,
      updateActualResultDto.groupId,
    );
    if (user_group.role_in_group != RoleInGroupEnum.LEADER) {
      throw new ForbiddenException(
        'Chỉ có trưởng nhóm mới có thể cập nhật kết quả thực tế hạng mục',
      );
    }
    const category: Category = await this.getCategoryById(
      updateActualResultDto.categoryId,
    );
    if (category.category_status != CategoryStatusEnum.DONE) {
      throw new BadRequestException(
        'Chỉ có thể cập nhật kết quả thực tế khi hạng mục đã hoàn thành',
      );
    }
    category.result_actual = updateActualResultDto.actual_result;
    try {
      await this.categoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi cập nhật kết quả thực tế hạng mục',
      );
    }
    await this.handleGetCategories(category.phase.id);
    return await this.getCategoryById(category.id);
  }

  async handleGetCategories(phaseId: number): Promise<void> {
    await this.phaseService.getPhaseById(phaseId);
    try {
      const categories: Category[] = await this.categoryRepository.find({
        relations: ['phase'],
      });
      if (categories.length === 0) {
        this.socketGateway.handleGetCategories({
          totalCategories: 0,
          categories: [],
        });
      }
      const result: Category[] = categories.filter(
        (category) => category.phase.id == phaseId,
      );
      const totalCategories: number = result.length;
      this.socketGateway.handleGetCategories({
        totalCategories: totalCategories,
        categories: result,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi truy xuất tất cả hạng mục của giai đoạn',
      );
    }
  }
}
