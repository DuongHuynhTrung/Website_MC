import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RoleEnum } from 'src/role/enum/role.enum';

export class SearchUserDto {
  @ApiProperty({
    description: 'Search String',
    example: 'da',
  })
  @IsOptional()
  @IsString()
  searchEmail: string;

  @ApiProperty({
    description: 'Role Enum',
    example: 'Student',
  })
  @IsNotEmpty()
  @IsEnum(RoleEnum)
  roleName: RoleEnum;
}
