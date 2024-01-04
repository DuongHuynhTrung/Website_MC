import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserChatDto {
  @IsNotEmpty()
  @IsString()
  senderEmail: string;

  @IsNotEmpty()
  @IsString()
  lastNameSender: string;

  @IsNotEmpty()
  @IsString()
  lastMessage: string;
}
