import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateNewBusinessDto {
  @ApiProperty({
    description: 'Is Create By Admin',
    example: true,
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_created_by_admin: boolean;

  @ApiProperty({
    description: 'Name of Business',
    example: 'Acb',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({
    description: 'Email of Business',
    example: 'Acb',
    nullable: false,
  })
  @IsString()
  @IsNotEmpty()
  businessEmail: string;
}
