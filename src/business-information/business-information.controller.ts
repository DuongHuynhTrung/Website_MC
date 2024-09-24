import {
  Controller,
  Delete,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessInformationService } from './business-information.service';
import { Express } from 'express'; // Import Express to resolve Multer typing
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiTags('Business')
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
      throw new Error('No file uploaded');
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
