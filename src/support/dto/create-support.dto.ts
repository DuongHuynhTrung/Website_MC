import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupportDto {
  @ApiProperty({
    description: 'Name of User Send Support',
    example: 'Abc',
  })
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @ApiProperty({
    description: 'Email of User Send Support',
    example: 'Abc',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Support Type',
    example: 'Abc',
  })
  @IsNotEmpty()
  @IsString()
  support_type: string;

  @ApiProperty({
    description: 'Support Content',
    example: 'Abc',
  })
  @IsNotEmpty()
  @IsString()
  support_content: string;

  @ApiProperty({
    description: 'Support Image',
    example: 'Abc',
  })
  @IsOptional()
  @IsString()
  support_image: string;
}
