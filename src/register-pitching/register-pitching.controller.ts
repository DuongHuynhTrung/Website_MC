import { User } from './../user/entities/user.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
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
import { UploadDocumentDto } from './dto/upload-document.dto';

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
  @Roles(RoleEnum.STUDENT, RoleEnum.LECTURER)
  getAllRegisterPitchingOfUser(
    @GetUser() user: User,
  ): Promise<RegisterPitching[]> {
    return this.registerPitchingService.getAllRegisterPitchingOfUser(user);
  }

  @ApiOperation({ summary: 'Check User Access To View Working Process' })
  @Get('checkUserAccessToViewWorkingProcess')
  checkUserAccessToViewWorkingProcess(
    @GetUser() user: User,
    @Query('groupId') groupId: number,
    @Query('projectId') projectId: number,
  ): Promise<boolean> {
    return this.registerPitchingService.checkUserAccessToViewWorkingProcess(
      user,
      groupId,
      projectId,
    );
  }

  @ApiOperation({ summary: 'Get All Register Pitching Of Business' })
  @ApiOkResponse({
    description: 'All Register Pitching are Retrieved',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi xảy ra khi truy xuất tất cả đăng ký pitching',
  })
  @Get(':projectId')
  getAllRegisterPitchingOfBusiness(
    @Param('projectId') projectId: number,
  ): Promise<RegisterPitching[]> {
    return this.registerPitchingService.getAllRegisterPitchingOfBusiness(
      projectId,
    );
  }

  @ApiOperation({
    summary: 'Get All Register Pitching Of Student By ProjectId',
  })
  @ApiOkResponse({
    description: 'All Register Pitching are Retrieved',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi xảy ra khi truy xuất tất cả đăng ký pitching',
  })
  @Get('student/:projectId')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  getAllRegisterPitchingOfStudent(
    @Param('projectId') projectId: number,
    @GetUser() user: User,
  ): Promise<RegisterPitching[]> {
    return this.registerPitchingService.getAllRegisterPitchingOfStudent(
      projectId,
      user,
    );
  }

  @ApiOperation({ summary: 'Get Register Pitching By Id' })
  @ApiOkResponse({
    description: 'Register Pitching with Id is retrieved',
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy lịch đăng ký pitching với id ${id}',
  })
  @Get('getOne/:id')
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
  @Roles(RoleEnum.BUSINESS, RoleEnum.RESPONSIBLE_PERSON)
  @Patch('chooseGroup/:groupId/:projectId')
  update(
    @Param('groupId') groupId: number,
    @Param('projectId') projectId: number,
    @GetUser() user: User,
  ) {
    return this.registerPitchingService.chooseGroup(groupId, projectId, user);
  }

  @ApiOperation({ summary: 'Leader Upload Document' })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy lịch đăng ký pitching với id ${id}',
  })
  @ApiForbiddenResponse({
    description: 'Sinh viên không có trong nhóm, không thể upload tài liệu',
  })
  @ApiForbiddenResponse({
    description: 'Chỉ có trưởng nhóm mới có thế upload tài liệu',
  })
  @ApiBadRequestResponse({
    description:
      'Chỉ có thể upload tài liệu khi đang chờ doanh nghiệp phản hồi',
  })
  @ApiInternalServerErrorResponse({
    description: 'Có lỗi xảy ra khi upload tài liệu khi đăng kí pitching',
  })
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.STUDENT)
  @Patch('uploadDocument')
  uploadDocument(
    @Body() uploadDocumentDto: UploadDocumentDto,
    @GetUser() user: User,
  ): Promise<RegisterPitching> {
    return this.registerPitchingService.uploadDocument(uploadDocumentDto, user);
  }
}
