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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { Phase } from './entities/phase.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { PhaseStatusEnum } from './enum/phase-status.enum';
import { UploadFeedbackDto } from './dto/upload-feedback.dto';

@ApiTags('Phase')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('phases')
export class PhaseController {
  constructor(private readonly phaseService: PhaseService) {}

  @ApiOperation({ summary: 'Create new Phase' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  createPhase(
    @Body() createPhaseDto: CreatePhaseDto,
    @GetUser() user: User,
  ): Promise<Phase> {
    return this.phaseService.createPhase(createPhaseDto, user);
  }

  @ApiOperation({ summary: 'Check All Phase of Project are Done' })
  @Get('checkProjectCanDone/:projectId')
  checkProjectCanDone(@Param('projectId') projectId: number): Promise<boolean> {
    return this.phaseService.checkProjectCanBeDone(projectId);
  }

  @ApiOperation({ summary: 'Get All Phase Of Project' })
  @Get(':projectId')
  getAllPhaseOfProject(@Param('projectId') projectId: number) {
    return this.phaseService.getAllPhaseOfProject(projectId);
  }

  @ApiOperation({ summary: 'Get Phase Of Project At Phase Number' })
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

  @ApiOperation({
    summary: 'Business/Lecturer upload feedback for phase after Done',
  })
  @Patch('uploadFeedback')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS, RoleEnum.LECTURER)
  uploadFeedback(
    @Body() uploadFeedbackDto: UploadFeedbackDto,
    @GetUser() user: User,
  ): Promise<Phase> {
    return this.phaseService.uploadFeedback(uploadFeedbackDto, user);
  }

  @ApiOperation({ summary: 'Update Phase Information In Status Processing' })
  @Patch(':id')
  updatePhase(
    @Param('id') id: number,
    @Body() updatePhaseDto: UpdatePhaseDto,
    @GetUser() user: User,
  ) {
    return this.phaseService.updatePhase(id, updatePhaseDto, user);
  }

  @ApiOperation({ summary: 'Change Phase Status' })
  @Patch('changeStatus/:phaseId/:phaseStatus')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  changePhaseStatus(
    @Param('phaseId') phaseId: number,
    @Param('phaseStatus') phaseStatus: PhaseStatusEnum,
  ): Promise<Phase> {
    return this.phaseService.changePhaseStatus(phaseId, phaseStatus);
  }
}
