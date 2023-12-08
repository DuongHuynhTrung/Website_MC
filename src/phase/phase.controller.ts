import { User } from './../user/entities/user.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PhaseService } from './phase.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { Phase } from './entities/phase.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { PhaseStatusEnum } from './enum/phase-status.enum';

@ApiTags('Phase')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('phases')
export class PhaseController {
  constructor(private readonly phaseService: PhaseService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  createPhase(
    @Body() createPhaseDto: CreatePhaseDto,
    @GetUser() user: User,
  ): Promise<Phase> {
    return this.phaseService.createPhase(createPhaseDto, user);
  }

  @Get(':projectId')
  getAllPhaseOfProject(@Param('projectId') projectId: number) {
    return this.phaseService.getAllPhaseOfProject(projectId);
  }

  @Get(':projectId/:phaseNumber')
  getPhaseOfProjectAtPhaseNumber(
    @Param('projectId') projectId: number,
    @Param('phaseNumber') phaseNumber: number,
  ) {
    return this.phaseService.getPhaseOfProjectAtPhaseNumber(
      projectId,
      phaseNumber,
    );
  }

  @Patch(':id')
  updatePhase(
    @Param('id') id: number,
    @Body() updatePhaseDto: UpdatePhaseDto,
    @GetUser() user: User,
  ) {
    return this.phaseService.updatePhase(id, updatePhaseDto, user);
  }

  @Patch('changeStatus/:phaseId/:phaseStatus')
  changePhaseStatus(
    @Param('phaseId') phaseId: number,
    @Param('phaseStatus') phaseStatus: PhaseStatusEnum,
  ): Promise<Phase> {
    return this.phaseService.changePhaseStatus(phaseId, phaseStatus);
  }
}
