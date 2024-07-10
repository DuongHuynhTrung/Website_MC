import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { Category } from './entities/category.entity';
import { CategoryStatusEnum } from './enum/category-status.enum';
import { UpdateActualResultDto } from './dto/update-actual-result.dto';

@ApiTags('Category')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Create new Category' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoryService.createCategory(createCategoryDto, user);
  }

  @ApiOperation({ summary: 'Check All Phase of Phase are Done' })
  @Get('checkPhaseCanDone/:phaseId')
  checkPhaseCanDone(@Param('phaseId') phaseId: number): Promise<boolean> {
    return this.categoryService.checkPhaseCanBeDone(phaseId);
  }

  @ApiOperation({ summary: 'Get All Categories of Phase' })
  @Get('all/:phaseId')
  getAllCategoryOfPhase(@Param('phaseId') phaseId: number) {
    return this.categoryService.getAllCategoryOfPhase(phaseId);
  }

  @ApiOperation({ summary: 'Get Category By Category Id' })
  @Get(':id')
  getCategoryById(@Param('id') id: number) {
    return this.categoryService.getCategoryById(id);
  }

  @ApiOperation({ summary: 'Update Actual Result after Done Project' })
  @Patch('updateActualResult')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  updateActualResult(
    @Body() updateActualResultDto: UpdateActualResultDto,
    @GetUser() user: User,
  ): Promise<Category> {
    return this.categoryService.updateActualResult(updateActualResultDto, user);
  }

  @ApiOperation({ summary: 'Update Category Information' })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  updateCategory(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto, user);
  }

  @ApiOperation({ summary: 'Update Category Information' })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  deleteCategoryById(@Param('id') id: number) {
    return this.categoryService.deleteCategoryById(id);
  }

  @ApiOperation({ summary: 'Change Category Status' })
  @Patch('changeStatus/:categoryId/:categoryStatus')
  changeCategoryStatus(
    @Param('categoryId') categoryId: number,
    @Param('categoryStatus') categoryStatus: CategoryStatusEnum,
  ): Promise<Category> {
    return this.categoryService.changeCategoryStatus(
      categoryId,
      categoryStatus,
    );
  }
}
