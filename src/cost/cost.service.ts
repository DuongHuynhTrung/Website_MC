import { Category } from 'src/category/entities/category.entity';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { Cost } from './entities/cost.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryService } from 'src/category/category.service';
import { CategoryStatusEnum } from 'src/category/enum/category-status.enum';
import { CostStatusEnum } from './enum/cost-status.enum';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { RoleEnum } from 'src/role/enum/role.enum';
import { PhaseService } from 'src/phase/phase.service';
import { Phase } from 'src/phase/entities/phase.entity';
import { UpdateActualCostDto } from './dto/update-actual-cost.dto';
import { UserProjectService } from 'src/user-project/user-project.service';
import { UserProject } from 'src/user-project/entities/user-project.entity';
import { UserProjectStatusEnum } from 'src/user-project/enum/user-project-status.enum';

@Injectable()
export class CostService {
  constructor(
    @InjectRepository(Cost)
    private readonly costRepository: Repository<Cost>,

    private readonly categorySErvice: CategoryService,

    private readonly userService: UserService,

    private readonly phaseService: PhaseService,

    private readonly userProjectService: UserProjectService,
  ) {}

  async createCost(createCostDto: CreateCostDto): Promise<Cost> {
    const category: Category = await this.categorySErvice.getCategoryById(
      createCostDto.categoryId,
    );
    if (category.category_status != CategoryStatusEnum.TODO) {
      throw new BadRequestException(
        'Chỉ có thể tạo chi phí khi hạng mục đang ở trạng thái cần làm',
      );
    }
    const phase: Phase = await this.phaseService.getPhaseById(
      createCostDto.phaseId,
    );
    if (category.phase.id != phase.id) {
      throw new BadRequestException(
        `Hạng mục này không thuộc về giai đoạn ${phase.id}`,
      );
    }
    const isExistCost = await this.checkCategoryHasCost(
      createCostDto.categoryId,
    );
    if (isExistCost) {
      throw new BadRequestException('Hạng mục này đã tồn tại chi phí');
    }
    const cost: Cost = this.costRepository.create(createCostDto);
    if (!cost) {
      throw new BadRequestException('Có lỗi xảy ra khi tạo chi phí');
    }
    cost.category = category;
    try {
      await this.costRepository.save(cost);
    } catch (error) {
      throw new InternalServerErrorException('Có lỗi xảy ra khi lưu chi phí');
    }
    // Update Expected Cost in Phase
    phase.expected_cost_total += cost.expected_cost;
    await this.phaseService.savePhase(phase);

    return await this.getCostByID(cost.id);
  }

  async checkCategoryHasCost(categoryId: number) {
    const costs: Cost[] = await this.costRepository.find({
      relations: ['category'],
    });
    if (costs.length === 0) {
      return false;
    }
    costs.forEach((cost) => {
      if (cost.category.id == categoryId) {
        return true;
      }
    });
    return false;
  }

  async getCostByID(costId: number): Promise<Cost> {
    try {
      const cost: Cost = await this.costRepository.findOne({
        where: { id: costId },
        relations: ['category'],
      });
      if (!cost) {
        throw new NotFoundException(`Không tìm thấy chi phí với id ${costId}`);
      }
      return cost;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getCostOfCategory(categoryId: number): Promise<Cost> {
    await this.categorySErvice.getCategoryById(categoryId);
    try {
      const costs: Cost[] = await this.costRepository.find({
        relations: ['category'],
      });
      if (costs.length === 0) {
        throw new NotFoundException('Không có một chi phí nào trong hệ thống');
      }
      const result: Cost = costs.find((cost) => cost.category.id == categoryId);
      return result;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateCost(id: number, updateCostDto: UpdateCostDto): Promise<Cost> {
    const cost: Cost = await this.getCostByID(id);
    if (cost.cost_status != CostStatusEnum.NOT_TRANSFERRED) {
      throw new BadRequestException(
        'Chỉ có thể sửa chi phí khi doanh nghiệp chưa chuyển tiền',
      );
    }
    cost.expected_cost = updateCostDto.expected_cost;
    try {
      await this.costRepository.save(cost);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi cập nhật thông tin chi phí',
      );
    }
    return await this.getCostByID(id);
  }

  async changeCostStatus(
    costId: number,
    costStatus: CostStatusEnum,
    user: User,
  ): Promise<Cost> {
    const cost: Cost = await this.costRepository
      .createQueryBuilder('cost')
      .leftJoin('cost.category', 'category')
      .leftJoin('category.phase', 'phase')
      .leftJoin('phase.project', 'project')
      .where('cost.id = :costId', { costId })
      .getOne();
    if (costStatus === CostStatusEnum.TRANSFERRED) {
      const checkUserInProject: UserProject =
        await this.userProjectService.checkUserInProject(
          user.id,
          cost.category.phase.project.id,
        );
      if (
        checkUserInProject.user_project_status != UserProjectStatusEnum.EDIT &&
        checkUserInProject.user_project_status != UserProjectStatusEnum.OWNER
      ) {
        throw new ForbiddenException(
          'Chỉ có doanh nghiệp và người phụ trách được cấp quyền có thể xác nhận đã chuyển tiền',
        );
      }
      cost.cost_status = costStatus;
      try {
        const result: Cost = await this.costRepository.save(cost);
        return await this.getCostByID(result.id);
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi thay đổi trạng thái chi phí',
        );
      }
    } else if (costStatus === CostStatusEnum.RECEIVED) {
      const student: User = await this.userService.getUserByEmail(user.email);
      if (student.role.role_name != RoleEnum.STUDENT) {
        throw new ForbiddenException(
          'Chỉ có sinh viên được quyền xác nhận đã nhận tiền',
        );
      }
      if (cost.cost_status != CostStatusEnum.TRANSFERRED) {
        throw new BadRequestException(
          'Chỉ có thể xác nhận đã nhận thì khi doanh nghiệp đã chuyển',
        );
      }
      cost.cost_status = costStatus;
      try {
        const result: Cost = await this.costRepository.save(cost);
        return await this.getCostByID(result.id);
      } catch (error) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi thay đổi trạng thái chi phí',
        );
      }
    } else {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }
  }

  async updateActualCost(
    updateActualCostDto: UpdateActualCostDto,
  ): Promise<Cost> {
    const cost: Cost = await this.getCostByID(updateActualCostDto.costId);
    const category: Category = await this.categorySErvice.getCategoryById(
      updateActualCostDto.categoryId,
    );
    const phase: Phase = await this.phaseService.getPhaseById(
      updateActualCostDto.phaseId,
    );
    if (category.category_status != CategoryStatusEnum.DONE) {
      throw new BadRequestException(
        'Chỉ có thể cập nhật chi phí thực tế khi hạng mục đã hoàn thành',
      );
    }
    if (cost.category.id != category.id) {
      throw new BadRequestException('Chi phí không thuộc về hạng mục');
    }
    if (category.phase.id != phase.id) {
      throw new BadRequestException(
        `Hạng mục không thuộc về giai đoạn ${phase.id}`,
      );
    }
    cost.actual_cost = updateActualCostDto.actual_cost;
    try {
      await this.costRepository.save(cost);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi cập nhật chi phí thực tế',
      );
    }
    // Update Actual Cost Of Phase
    phase.actual_cost_total += updateActualCostDto.actual_cost;
    await this.phaseService.savePhase(phase);

    return await this.getCostByID(cost.id);
  }
}
