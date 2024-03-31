import { ApiProperty } from '@nestjs/swagger';
import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/user/entities/user.entity';
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

@Entity()
export class ResponsiblePerson {
  @ApiProperty({
    description: 'Id of Responsible Person Information',
    example: 1,
    nullable: false,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Full Name of Responsible Person Information',
    example: 'Huỳnh Trùng Dương',
    nullable: false,
  })
  @Column({ nullable: false })
  fullname: string;

  @ApiProperty({
    description: 'Position of Responsible Person Information',
    example: 'Leader',
    nullable: false,
  })
  @Column({ nullable: false })
  position: string;

  @ApiProperty({
    description: 'Email of Responsible Person Information',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @Column({ nullable: false, unique: true })
  email: string;

  @ApiProperty({
    description: 'Phone Number of Responsible Person Information',
    example: '0838323403',
    nullable: false,
  })
  @Column({ nullable: false, unique: true })
  phone_number: string;

  @ApiProperty({
    description: 'Other Contact of Responsible Person Information',
    example: 'Abc',
    nullable: true,
  })
  @Column({ nullable: true })
  other_contact: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Project, (project) => project.responsible_person)
  projects: Project[];

  @OneToOne(() => User, (user) => user.responsible_person)
  @JoinColumn()
  business: User;
}
