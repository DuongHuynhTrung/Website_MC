import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserChatDto {
  @IsNotEmpty()
  @IsString()
  groupName: string;

  @IsNotEmpty()
  @IsString()
  avatarGroup: string;

  @IsNotEmpty()
  @IsString()
  lastMessage: string;

  @IsNotEmpty()
  @IsString()
  identifierUserChat: string;
}
