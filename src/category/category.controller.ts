import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { Category } from './entities/category.entity';
import { CategoryStatusEnum } from './enum/category-status.enum';

@ApiTags('Category')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoryService.createCategory(createCategoryDto, user);
  }

  @Get('all/:phaseId')
  getAllCategoryOfPhase(@Param('phaseId') phaseId: number) {
    return this.categoryService.getAllCategoryOfPhase(phaseId);
  }

  @Get(':id')
  getCategoryById(@Param('id') id: number) {
    return this.categoryService.getCategoryById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.categoryService.updateCategory(id, updateCategoryDto, user);
  }

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
