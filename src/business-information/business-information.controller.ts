import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessInformationService } from './business-information.service';
import { Express } from 'express'; // Import Express to resolve Multer typing
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from 'src/role/enum/role.enum';
import { JwtGuard } from 'src/auth/jwt.guard';

@ApiTags('Business')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(RoleEnum.ADMIN)
@UseGuards(JwtGuard)
@Controller('business')
export class BusinessInformationController {
  constructor(
    private readonly businessInformationService: BusinessInformationService,
  ) {}

  @Post('import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importBusinesses(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) {
      return { message: 'No file uploaded' };
    }
    await this.businessInformationService.importBusinessesFromExcel(
      file.buffer,
    );
    return { message: 'Businesses imported successfully' };
  }

  @Get()
  async getAllBusinessInfo() {
    return await this.businessInformationService.getAllBusinessInfo();
  }

  @Delete()
  async clearAllBusinessInfo() {
    return await this.businessInformationService.clearAllBusinessInfo(); // Use the buffer instead of file.path
  }
}
