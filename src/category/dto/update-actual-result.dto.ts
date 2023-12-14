import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateActualResultDto {
  @ApiProperty({
    description: 'Category Id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: 'Group Id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;

  @ApiProperty({
    description: 'Category Actual Result',
    example: 'Hoàn thành đúng như dự kiến',
  })
  @IsNotEmpty()
  @IsString()
  actual_result: string;
}
