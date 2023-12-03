import { UserGroup } from 'src/user-group/entities/user-group.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  group_name: string;

  @Column({ nullable: false })
  group_quantity: number;

  @OneToMany(() => UserGroup, (user_group) => user_group.group)
  user_groups: UserGroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
