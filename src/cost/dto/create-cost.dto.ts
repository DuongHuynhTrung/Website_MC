import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCostDto {
  @ApiProperty({
    description: 'Expected Cost',
    example: 3000000,
  })
  @IsNotEmpty()
  @IsNumber()
  expected_cost: number;

  @ApiProperty({
    description: 'Category ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;
}
