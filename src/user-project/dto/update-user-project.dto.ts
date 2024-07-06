import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { UserProjectStatusEnum } from '../enum/user-project-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProjectDto {
  @ApiProperty({
    description: 'User Id',
    example: 1,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Project Id',
    example: 1,
    nullable: false,
  })
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @ApiProperty({
    description: 'Status of Responsible Person',
    example: UserProjectStatusEnum.EDIT,
    nullable: false,
  })
  @IsNotEmpty()
  @IsEnum(UserProjectStatusEnum)
  status: UserProjectStatusEnum;

  @ApiProperty({
    description: 'Is Create Account',
    example: true,
    nullable: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_create_account: boolean = false;
}
