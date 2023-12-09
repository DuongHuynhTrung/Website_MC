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
import { RegisterPitchingService } from './register-pitching.service';
import { CreateRegisterPitchingDto } from './dto/create-register-pitching.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { RegisterPitching } from './entities/register-pitching.entity';

@ApiTags('Register Pitching')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('register-pitching')
export class RegisterPitchingController {
  constructor(
    private readonly registerPitchingService: RegisterPitchingService,
  ) {}

  @ApiOperation({ summary: 'Register Pitching' })
  @ApiOkResponse({
    description: 'Register Pitching Successfully',
    type: RegisterPitching,
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy dự án',
  })
  @ApiBadRequestResponse({
    description: 'Chỉ có dự án đang được công bố mới có thể đăng kí pitching',
  })
  @ApiForbiddenResponse({
    description: 'Sinh viên không có trong nhóm, không thể đăng ký pitching',
  })
  @ApiForbiddenResponse({
    description: 'Chỉ có trưởng nhóm mới có thế đăng ký pitching',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi xảy ra khi lưu thông tin đăng ký pitching',
  })
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  @Post()
  registerPitching(
    @Body() createRegisterPitchingDto: CreateRegisterPitchingDto,
    @GetUser() user: User,
  ): Promise<RegisterPitching> {
    return this.registerPitchingService.registerPitching(
      createRegisterPitchingDto,
      user,
    );
  }

  @ApiOperation({ summary: 'Get All Register Pitching Of User' })
  @ApiOkResponse({
    description: 'All Register Pitching are Retrieved',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi xảy ra khi truy xuất tất cả đăng ký pitching',
  })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  getAllRegisterPitchingOfUser(
    @GetUser() user: User,
  ): Promise<RegisterPitching[]> {
    return this.registerPitchingService.getAllRegisterPitchingOfUser(user);
  }

  @ApiOperation({ summary: 'Get All Register Pitching Of Business' })
  @ApiOkResponse({
    description: 'All Register Pitching are Retrieved',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi xảy ra khi truy xuất tất cả đăng ký pitching',
  })
  @Get(':projectId')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS)
  getAllRegisterPitchingOfBusiness(
    @Param('projectId') projectId: number,
  ): Promise<RegisterPitching[]> {
    return this.registerPitchingService.getAllRegisterPitchingOfBusiness(
      projectId,
    );
  }

  @ApiOperation({ summary: 'Get Register Pitching By Id' })
  @ApiOkResponse({
    description: 'Register Pitching with Id is retrieved',
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy lịch đăng ký pitching với id ${id}',
  })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.registerPitchingService.getRegisterPitchingById(id);
  }

  @ApiOperation({ summary: 'Business Choose Group' })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy dự án',
  })
  @ApiNotFoundResponse({
    description: 'Không có một đăng ký pitching nào',
  })
  @ApiNotFoundResponse({
    description: 'Nhóm đã chọn không đăng kí pitching dự án',
  })
  @ApiNotFoundResponse({
    description: 'Dự án không có đăng ký pitching nào',
  })
  @ApiForbiddenResponse({
    description: 'Chỉ có doanh nghiệp của dự án mới có thể chọn nhóm',
  })
  @ApiForbiddenResponse({
    description: 'Chỉ có dự án đang được công bố mới cần chọn nhóm làm',
  })
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS)
  @Patch('chooseGroup/:groupId/:projectId')
  update(
    @Param('groupId') groupId: number,
    @Param('projectId') projectId: number,
    @GetUser() user: User,
  ) {
    return this.registerPitchingService.chooseGroup(groupId, projectId, user);
  }
}
