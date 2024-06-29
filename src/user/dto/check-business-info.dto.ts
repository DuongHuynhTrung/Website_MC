import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CheckBusinessInfoDto {
  // Business properties
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
  @IsEmail()
  @IsNotEmpty()
  businessEmail: string;

  @ApiProperty({
    description: 'Description of Business',
    example: 'Friendly',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  business_description: string;

  @ApiProperty({
    description: 'Business Sector',
    example: 'Friendly',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  business_sector: string;

  @ApiProperty({
    description: 'Address of User',
    example: 'Ho Chi Minh',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Address Detail of User',
    example: 'Số 123, khu phố 4',
    nullable: true,
  })
  @IsString()
  @IsNotEmpty()
  address_detail: string;
}
