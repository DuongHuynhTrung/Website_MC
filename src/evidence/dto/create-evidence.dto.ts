import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEvidenceDto {
  @ApiProperty({
    description: 'Evidence Image URL',
    example: 'abc',
  })
  @IsString()
  @IsNotEmpty()
  evidence_url: string;

  @ApiProperty({
    description: 'Cost Id',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  costId: number;
}
