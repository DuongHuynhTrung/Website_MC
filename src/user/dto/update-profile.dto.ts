import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { GenderEnum } from '../enum/gender.enum';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'UserName of User',
    example: 'DuongHuynh02',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  fullname: string;

  @ApiProperty({
    description: 'Avatar URL of User',
    example:
      'https://www.vivosmartphone.vn/uploads/MANGOADS/ch%E1%BB%A5p%20%E1%BA%A3nh/ki%E1%BB%83u%20ch%E1%BB%A5p%20%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20cho%20n%E1%BB%AF/kieu%20chup%20hinh%20dep%20cho%20nu%202.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  avatar_url: string;

  @ApiProperty({
    description: 'Date of Birth of User',
    example: '22/02/2001',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  dob: Date;

  @ApiProperty({
    description: 'Gender of User',
    example: 'Male',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @ApiProperty({
    description: 'Address of User',
    example: 'Ho Chi Minh',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Address Detail of User',
    example: 'Số 123, khu phố 4',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  address_detail: string;

  @ApiProperty({
    description: 'Phone Number of User',
    example: '0838462852',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  phone_number: string;

  @ApiProperty({
    description: 'Discription of User',
    example: 'Friendly',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Link Website of User',
    example: 'Friendly',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  link_web: string;

  @ApiProperty({
    description: 'Link Website of User',
    example: 'Friendly',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  role_name: string;
}
