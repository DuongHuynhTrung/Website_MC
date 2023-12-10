import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateActualCostDto {
  @ApiProperty({
    description: 'Cost Id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  costId: number;

  @ApiProperty({
    description: 'Actual Cost',
    example: 4000000,
  })
  @IsNotEmpty()
  @IsNumber()
  actual_cost: number;

  @ApiProperty({
    description: 'Phase Id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  phaseId: number;

  @ApiProperty({
    description: 'Category Id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;
}
