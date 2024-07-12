import { Cost } from 'src/cost/entities/cost.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Evidence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  evidence_url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Cost, (cost) => cost.evidences)
  cost: Cost;
}
