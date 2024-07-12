import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateEvidenceDto {
  @ApiProperty({
    description: 'Evidence Image URLs',
    example: ['abc'],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  evidence_url: string[];

  @ApiProperty({
    description: 'Cost Id',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  costId: number;
}
