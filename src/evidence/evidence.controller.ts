import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Evidence } from './entities/evidence.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';

@ApiTags('Evidence')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('evidences')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @ApiOperation({ summary: 'Create new Evidence' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  createEvidence(
    @Body() createEvidenceDto: CreateEvidenceDto,
  ): Promise<Evidence> {
    return this.evidenceService.createEvidence(createEvidenceDto);
  }

  @ApiOperation({ summary: 'Get All Evidence of Cost' })
  @Get('cost/:costId')
  getAllEvidenceOfCost(@Param('costId') costId: number): Promise<Evidence[]> {
    return this.evidenceService.getAllEvidenceOfCost(costId);
  }

  @ApiOperation({ summary: 'Get Evidence By Id' })
  @Get(':id')
  getEvidenceById(@Param('id') id: number): Promise<Evidence> {
    return this.evidenceService.getEvidenceById(id);
  }

  @ApiOperation({ summary: 'Update Evidence Information' })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  updateEvidence(
    @Param('id') id: number,
    @Body() updateEvidenceDto: UpdateEvidenceDto,
  ): Promise<Evidence> {
    return this.evidenceService.updateEvidence(id, updateEvidenceDto);
  }
}
