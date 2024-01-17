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

  @Column({ nullable: true })
  senderEmail: string;

  @Column({ nullable: true })
  lastNameSender: string;

  @Column()
  lastMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
