import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Role {
  @ApiProperty({
    description: 'Role Id',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Role Name',
    example: 1,
  })
  @Column()
  role_name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
