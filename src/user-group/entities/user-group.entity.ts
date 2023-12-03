import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RelationshipStatusEnum } from '../enum/relationship-status.enum';
import { Group } from 'src/group/entities/group.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class UserGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: false })
  is_leader: boolean;

  @Column({ nullable: false, default: RelationshipStatusEnum.PENDING })
  relationship_status: RelationshipStatusEnum;

  @ManyToOne(() => Group, (group) => group.user_groups)
  group: Group;

  @ManyToOne(() => User, (user) => user.user_groups)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(user: User, group: Group) {
    this.user = user;
    this.group = group;
  }
}
