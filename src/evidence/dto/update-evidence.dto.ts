import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateEvidenceDto {
  @ApiProperty({
    description: 'Evidence Image URLs',
    example: ['abc'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
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
