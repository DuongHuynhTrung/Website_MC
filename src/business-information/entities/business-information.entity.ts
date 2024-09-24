import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BusinessInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  businessField: string;

  @Column({ nullable: true })
  shortIntro: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  website: string;

  @Column()
  contactName: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  otherContactInfo: string;
}
