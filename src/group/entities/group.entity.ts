import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupStatusEnum } from '../enum/group-status.enum';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  group_name: string;

  @Column({ nullable: false })
  group_quantity: number;

  @Column({ nullable: false, default: GroupStatusEnum.FREE })
  group_status: GroupStatusEnum;

  @OneToMany(() => UserGroup, (user_group) => user_group.group)
  user_groups: UserGroup[];

  @OneToMany(
    () => RegisterPitching,
    (register_pitching) => register_pitching.group,
  )
  register_pitchings: RegisterPitching[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
