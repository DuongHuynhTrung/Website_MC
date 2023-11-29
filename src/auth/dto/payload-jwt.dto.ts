import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class PayloadJwtDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsBoolean()
  status: boolean;

  @IsNotEmpty()
  role_name: string;

  @IsBoolean()
  isNewUser: boolean;
}
