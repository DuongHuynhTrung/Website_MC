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
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('Feedback')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @ApiOperation({ summary: 'Create new Feedback' })
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS, RoleEnum.RESPONSIBLE_PERSON)
  @Post()
  createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @GetUser() user: User,
  ): Promise<Feedback> {
    return this.feedbackService.createFeedback(createFeedbackDto, user);
  }

  @ApiOperation({ summary: 'Get All Feedback' })
  @Get()
  getFeedbacks(): Promise<Feedback[]> {
    return this.feedbackService.getFeedbacks();
  }

  @ApiOperation({ summary: 'Get Feedback By Id' })
  @Get(':id')
  getFeedbackById(@Param('id') id: number): Promise<Feedback> {
    return this.feedbackService.getFeedbackById(id);
  }

  @ApiOperation({ summary: 'Update Feedback' })
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS, RoleEnum.RESPONSIBLE_PERSON)
  @Patch(':id')
  updateFeedback(
    @Param('id') id: number,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @GetUser() user: User,
  ): Promise<Feedback> {
    return this.feedbackService.updateFeedback(id, updateFeedbackDto, user);
  }

  @ApiOperation({ summary: 'Delete Feedback' })
  @Delete(':id')
  deleteFeedback(@Param('id') id: number): Promise<Feedback> {
    return this.feedbackService.deleteFeedback(id);
  }
}
