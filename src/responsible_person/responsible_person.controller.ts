import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ResponsiblePersonService } from './responsible_person.service';
import { CreateResponsiblePersonDto } from './dto/create-responsible_person.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponsiblePerson } from './entities/responsible_person.entity';
import { UpdateResponsiblePersonDto } from './dto/update-responsible_person.dto';
import { JwtGuard } from 'src/auth/jwt.guard';

@ApiTags('Responsible Person')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('responsible-person')
export class ResponsiblePersonController {
  constructor(
    private readonly responsiblePersonService: ResponsiblePersonService,
  ) {}

  @ApiOperation({ summary: 'Create Responsible Person Info' })
  @ApiOkResponse({
    description: 'Create Responsible Person successfully.',
    type: ResponsiblePerson,
  })
  @ApiBadRequestResponse({
    description: 'Something went wrong when creating the Responsible Person',
  })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong when saving the Responsible Person',
  })
  @Post()
  createResponsiblePerson(
    @Body() createResponsiblePersonDto: CreateResponsiblePersonDto,
  ) {
    return this.responsiblePersonService.createResponsiblePerson(
      createResponsiblePersonDto,
    );
  }

  @ApiOperation({ summary: 'Update Responsible Person Info' })
  @ApiOkResponse({
    description: 'Update Responsible Person successfully.',
    type: ResponsiblePerson,
  })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy Người chịu trách nhiệm!',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Có lỗi xảy ra khi cập nhật thông tin của người chịu trách nhiệm',
  })
  @Patch()
  updateResponsiblePersonDto(
    @Body() updateResponsiblePersonDto: UpdateResponsiblePersonDto,
  ) {
    return this.responsiblePersonService.updateResponsiblePerson(
      updateResponsiblePersonDto,
    );
  }

  @ApiOperation({ summary: 'Search Responsible Person By Email' })
  @ApiOkResponse({
    description:
      'The List of Responsible Person has been successfully retrieved.',
    type: [ResponsiblePerson],
  })
  @ApiBadRequestResponse({
    description: 'Could not find with ${searchEmail}',
  })
  @Get('search-responsible-person')
  searchResponsiblePerson(@Query('search-email') searchEmail: string) {
    return this.responsiblePersonService.searchResponsiblePersonByEmail(
      searchEmail,
    );
  }

  @ApiOperation({ summary: 'Get Responsible Person Info' })
  @ApiOkResponse({
    description: 'The Responsible Person has been successfully retrieved.',
    type: ResponsiblePerson,
  })
  @ApiBadRequestResponse({
    description: 'ResponsiblePerson not found',
  })
  @Get(':email')
  getResponsiblePersonByEmail(@Param('email') email: string) {
    return this.responsiblePersonService.getResponsiblePersonByEmail(email);
  }
}
