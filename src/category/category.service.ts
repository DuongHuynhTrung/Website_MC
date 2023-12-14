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
import * as moment from 'moment';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { Phase } from 'src/phase/entities/phase.entity';
import { CategoryStatusEnum } from './enum/category-status.enum';
import { RoleInGroupEnum } from 'src/user-group/enum/role-in-group.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    private readonly phaseService: PhaseService,

    private readonly userGroupService: UserGroupService,
  ) {}

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<Category> {
    const start_date = moment(createCategoryDto.category_start_date);
    const expected_end_date = moment(
      createCategoryDto.category_expected_end_date,
    );
    if (start_date.isAfter(expected_end_date)) {
      throw new BadRequestException(
        'Ngày bắt đầu phải trước ngày mong muốn kết thúc',
      );
    }
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
    const start_date = moment(updateCategoryDto.category_start_date);
    const expected_end_date = moment(
      updateCategoryDto.category_expected_end_date,
    );
    if (start_date.isAfter(expected_end_date)) {
      throw new BadRequestException(
        'Ngày bắt đầu phải trước ngày mong muốn kết thúc',
      );
    }
    const user_group: UserGroup = await this.userGroupService.checkUserInGroup(
      user.id,
      updateCategoryDto.groupId,
    );
    if (user_group.role_in_group != RoleInGroupEnum.LEADER) {
      throw new ForbiddenException(
        'Chỉ có trưởng nhóm mới có thể tạo hạng mục',
      );
    }
    const category: Category = await this.getCategoryById(id);
    category.category_name = updateCategoryDto.category_name;
    category.detail = updateCategoryDto.detail;
    category.result_expected = updateCategoryDto.result_expected;
    try {
      await this.categoryRepository.save(category);
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
    category.category_status = categoryStatus;
    if (categoryStatus === CategoryStatusEnum.DONE) {
      category.category_actual_end_date = new Date();
    }
    try {
      const result: Category = await this.categoryRepository.save(category);
      return await this.getCategoryById(result.id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi trạng thái của hạng mục',
      );
    }
  }
}
