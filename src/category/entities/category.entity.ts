import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryStatusEnum } from '../enum/category-status.enum';
import { Phase } from 'src/phase/entities/phase.entity';
import { Cost } from 'src/cost/entities/cost.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  category_name: string;

  @Column({ nullable: false })
  detail: string;

  @Column({ nullable: false })
  category_start_date: Date;

  @Column({ nullable: false })
  category_expected_end_date: Date;

  @Column({ nullable: true })
  category_actual_end_date: Date;

  @Column({ nullable: false })
  result_expected: string;

  @Column({ nullable: true })
  result_actual: string;

  @Column({ nullable: false, default: CategoryStatusEnum.TODO })
  category_status: CategoryStatusEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Phase, (phase) => phase.categories)
  phase: Phase;

  @OneToOne(() => Cost, (cost) => cost.category)
  cost: Cost;
}
