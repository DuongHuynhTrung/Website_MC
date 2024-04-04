import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNewBusinessDto {
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
