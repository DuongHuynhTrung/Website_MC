import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';

@ApiTags('Support')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @ApiOperation({ summary: 'Create new Support' })
  @Post()
  createSupport(@Body() createSupportDto: CreateSupportDto) {
    return this.supportService.createSupport(createSupportDto);
  }

  @ApiOperation({ summary: 'Admin Get All Supports' })
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtGuard)
  @Get()
  getSupports() {
    return this.supportService.getSupports();
  }

  @ApiOperation({ summary: 'Admin Get Support By Id' })
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtGuard)
  @Get(':id')
  getSupportById(@Param('id') id: number) {
    return this.supportService.getSupportById(id);
  }
}
