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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Cost } from './entities/cost.entity';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { UpdateActualCostDto } from './dto/update-actual-cost.dto';

@ApiTags('Cost')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('cost')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @ApiOperation({ summary: 'Create new Cost' })
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  @Post()
  createCost(@Body() createCostDto: CreateCostDto): Promise<Cost> {
    return this.costService.createCost(createCostDto);
  }

  @ApiOperation({ summary: 'Get Cost Of Category' })
  @Get('all/:categoryId')
  getCostOfCategory(@Param('categoryId') categoryId: number): Promise<Cost> {
    return this.costService.getCostOfCategory(categoryId);
  }

  @ApiOperation({ summary: 'Get Cost By CostID' })
  @Get(':id')
  getCostByID(@Param('id') id: number): Promise<Cost> {
    return this.costService.getCostByID(id);
  }

  @ApiOperation({ summary: 'Update Actual Cost' })
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  @Patch('update-actual-cost')
  updateActualCost(
    @Body() updateActualCostDto: UpdateActualCostDto,
  ): Promise<{ cost: Cost; actualCostOfPhase: number }> {
    return this.costService.updateActualCost(updateActualCostDto);
  }

  @ApiOperation({ summary: 'Update Cost Information' })
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  @Patch(':id')
  updateCost(
    @Param('id') id: number,
    @Body() updateCostDto: UpdateCostDto,
  ): Promise<Cost> {
    return this.costService.updateCost(id, updateCostDto);
  }
}
