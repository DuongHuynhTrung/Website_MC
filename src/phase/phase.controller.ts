import { User } from './../user/entities/user.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

@ApiTags('Phase')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('phases')
export class PhaseController {
  constructor(private readonly phaseService: PhaseService) {}

  @Post(':groupId')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  createPhase(
    @Body() createPhaseDto: CreatePhaseDto,
    @GetUser() user: User,
    @Param('groupId') groupId: number,
  ): Promise<Phase> {
    return this.phaseService.createPhase(createPhaseDto, user, groupId);
  }

  @Get(':projectId')
  getAllPhaseOfProject(@Param('projectId') projectId: number) {
    return this.phaseService.getAllPhaseOfProject(projectId);
  }

  @Get(':projectId/:phaseNumber')
  findOne(
    @Param('projectId') projectId: number,
    @Param('phaseNumber') phaseNumber: number,
  ) {
    return this.phaseService.getPhaseOfProjectAtPhaseNumber(
      projectId,
      phaseNumber,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhaseDto: UpdatePhaseDto) {
    return this.phaseService.update(+id, updatePhaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phaseService.remove(+id);
  }
}
