import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserChat {
  @PrimaryColumn()
  identifierUserChat: string;

  @Column()
  groupName: string;

  @Column()
  avatarGroup: string;

  @Column()
  senderEmail: string;

  @Column()
  lastNameSender: string;

  @Column()
  newMsg: string;

  @Column()
  lastMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
