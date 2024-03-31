import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Support {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  fullname: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  support_type: string;

  @Column({ nullable: false })
  support_content: string;

  @Column({ nullable: true })
  support_image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
