import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/role/entities/role.entity';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { UserProject } from 'src/user-project/entities/user-project.entity';

@Entity()
export class User {
  @ApiProperty({
    description: 'User Id',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'UserName of User',
    example: 'DuongHuynh02',
    nullable: true,
  })
  @Column({ nullable: true })
  fullname: string;

  @ApiProperty({
    description: 'Avatar URL of User',
    example:
      'https://www.vivosmartphone.vn/uploads/MANGOADS/ch%E1%BB%A5p%20%E1%BA%A3nh/ki%E1%BB%83u%20ch%E1%BB%A5p%20%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20cho%20n%E1%BB%AF/kieu%20chup%20hinh%20dep%20cho%20nu%202.jpg',
    nullable: true,
  })
  @Column({ nullable: true })
  avatar_url: string;

  @ApiProperty({
    description: 'Date of Birth of User',
    example: '22/02/2001',
    nullable: true,
  })
  @Column({ nullable: true })
  dob: Date;

  @ApiProperty({
    description: 'Gender of User',
    example: 'Male',
    nullable: true,
  })
  @Column({ nullable: true })
  gender: string;

  @ApiProperty({
    description: 'Address of User',
    example: 'Ho Chi Minh',
    nullable: true,
  })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({
    description: 'Address Detail of User',
    example: 'Số 123, khu phố 4',
    nullable: true,
  })
  @Column({ nullable: true })
  address_detail: string;

  @ApiProperty({
    description: 'Phone Number of User',
    example: '0838462852',
    nullable: true,
  })
  @Column({ nullable: true })
  phone_number: string;

  @ApiProperty({
    description: 'Roll Number of User',
    example: 'SE150080',
    nullable: true,
  })
  @Column({ nullable: true })
  role_number: string;

  @ApiProperty({
    description: 'Email of User',
    example: 'trungduong22021619@gmail.com',
    nullable: false,
  })
  @Column({ nullable: false, unique: true })
  email: string;

  @ApiProperty({
    description: 'Password of User',
    example: '123456',
    nullable: false,
  })
  @Column({ nullable: true })
  password: string;

  @ApiProperty({
    description: 'Description of User',
    example: 'Friendly',
    nullable: true,
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    description: 'Link Website of User',
    example: 'Friendly',
    nullable: true,
  })
  @Column({ nullable: true })
  link_web: string;

  @ApiProperty({
    description: 'Description of Business',
    example: 'Friendly',
    nullable: true,
  })
  @Column({ nullable: true })
  business_description: string;

  @ApiProperty({
    description: 'Business Sector',
    example: 'Friendly',
    nullable: true,
  })
  @Column({ nullable: true })
  business_sector: string;

  @ApiProperty({
    description: 'Position of Responsible Person Information',
    example: 'Leader',
    nullable: true,
  })
  @Column({ nullable: true })
  position: string;

  @ApiProperty({
    description: 'Other Contact of Responsible Person Information',
    example: 'Abc',
    nullable: true,
  })
  @Column({ nullable: true })
  other_contact: string;

  @ApiProperty({
    description: 'Is Confirm By Admin',
    example: true,
    nullable: false,
  })
  @Column({ nullable: false, default: true })
  isConfirmByAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Status of account',
    example: 'true',
    default: false,
  })
  @Column({ nullable: false, default: false })
  status: boolean;

  @ApiProperty({
    description: 'Is Account Banned',
    example: false,
    default: false,
  })
  @Column({ nullable: false, default: false })
  is_ban: boolean;

  @ApiProperty({
    description: 'Role Name of User',
    example: 'Admin',
  })
  @Column({ nullable: true })
  role_name: string;

  @ApiProperty({
    description: 'Role of User',
    example: 'Admin',
  })
  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @OneToMany(() => UserGroup, (user_group) => user_group.user)
  user_groups: UserGroup[];

  @OneToMany(() => UserProject, (user_project) => user_project.user)
  user_projects: UserProject[];

  @OneToMany(() => Notification, (notification) => notification.sender)
  sender_notifications: Notification[];

  @OneToMany(() => Notification, (notification) => notification.receiver)
  receiver_notifications: Notification[];

  // Factory method for Business Information
  static createForBusiness(
    fullname: string,
    businessEmail: string,
    business_sector: string,
    business_description: string,
    address: string,
    address_detail: string,
    link_web?: string,
  ): User {
    const user = new User();
    user.fullname = fullname;
    user.email = businessEmail;
    user.business_sector = business_sector;
    user.business_description = business_description;
    user.address = address;
    user.address_detail = address_detail;
    user.link_web = link_web;
    return user;
  }

  // Factory method for Responsible Person
  static createForResponsiblePerson(
    fullname: string,
    phone_number: string,
    position: string,
    email: string,
    other_contact?: string,
  ): User {
    const user = new User();
    user.fullname = fullname;
    user.phone_number = phone_number;
    user.position = position;
    user.email = email;
    user.other_contact = other_contact;
    return user;
  }
}
