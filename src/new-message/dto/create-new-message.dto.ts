import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNewMessageDto {
  @IsNotEmpty()
  @IsString()
  identifierUserChat: string;
}
