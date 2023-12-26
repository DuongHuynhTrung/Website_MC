import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationTypeEnum } from '../enum/notification-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Notification Type',
    example: NotificationTypeEnum.CREATE_PROJECT,
  })
  @IsNotEmpty()
  @IsEnum(NotificationTypeEnum)
  notification_type: NotificationTypeEnum;

  @ApiProperty({
    description: 'Notification Information',
    example: 'Tạo dự án thành công',
  })
  @IsNotEmpty()
  @IsString()
  information: string;

  @ApiProperty({
    description: 'Note for FE to navigate',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  note: number;

  @ApiProperty({
    description: 'Notification Sender Id',
    example: 'trungduong22021619@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  sender_email: string;

  @ApiProperty({
    description: 'Notification Receiver Id',
    example: 'dangnguyenminhan123@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  receiver_email: string;

  constructor(
    notification_type: NotificationTypeEnum,
    information: string,
    sender_email: string,
    receiver_email: string,
  ) {
    this.information = information;
    this.sender_email = sender_email;
    this.receiver_email = receiver_email;
    this.notification_type = notification_type;
  }
}
