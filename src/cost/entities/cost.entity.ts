import { Evidence } from './../../evidence/entities/evidence.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from 'src/category/entities/category.entity';

@Entity()
export class Cost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  expected_cost: number;

  @Column({ nullable: true })
  actual_cost: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Category, (category) => category.cost)
  @JoinColumn()
  category: Category;

  @OneToMany(() => Evidence, (evidence) => evidence.cost)
  evidences: Evidence[];
}
