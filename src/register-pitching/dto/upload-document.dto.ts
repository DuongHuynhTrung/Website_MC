import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Register Pitching Id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  register_pitching_id: number;

  @ApiProperty({
    description: ' Document URL',
    example: 'abc',
  })
  @IsNotEmpty()
  @IsString()
  document_url: string;
}
