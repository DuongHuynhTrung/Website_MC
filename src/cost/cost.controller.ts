import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CostService } from './cost.service';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Cost } from './entities/cost.entity';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { CostStatusEnum } from './enum/cost-status.enum';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('Cost')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('cost')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  @Post()
  createCost(@Body() createCostDto: CreateCostDto): Promise<Cost> {
    return this.costService.createCost(createCostDto);
  }

  @Get('all/:categoryId')
  getAllCostOfCategory(
    @Param('categoryId') categoryId: number,
  ): Promise<Cost[]> {
    return this.costService.getAllCostOfCategory(categoryId);
  }

  @Get(':id')
  getCostByID(@Param('id') id: number): Promise<Cost> {
    return this.costService.getCostByID(id);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  @Patch(':id')
  updateCost(
    @Param('id') id: number,
    @Body() updateCostDto: UpdateCostDto,
  ): Promise<Cost> {
    return this.costService.updateCost(id, updateCostDto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT, RoleEnum.BUSINESS)
  @Patch('changeStatus/:id/:costStatus')
  changeCostStatus(
    @Param('id') id: number,
    @Param('costStatus') costStatus: CostStatusEnum,
    @GetUser() user: User,
  ): Promise<Cost> {
    return this.costService.changeCostStatus(id, costStatus, user);
  }
}
