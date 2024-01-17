import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserChatDto {
  @IsNotEmpty()
  @IsString()
  groupName: string;

  @IsNotEmpty()
  @IsString()
  avatarGroup: string;

  @IsOptional()
  lastMessage: string;

  @IsNotEmpty()
  @IsString()
  identifierUserChat: string;
}
