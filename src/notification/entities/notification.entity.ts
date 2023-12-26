import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationTypeEnum } from '../enum/notification-type.enum';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  notification_type: NotificationTypeEnum;

  @Column()
  information: string;

  @Column({ nullable: true })
  note: number;

  @Column({ default: true })
  is_new: boolean;

  @ManyToOne(() => User, (user) => user.sender_notifications)
  sender: User;

  @ManyToOne(() => User, (user) => user.receiver_notifications)
  receiver: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
