import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BusinessInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  businessName: string;

  @Column()
  businessField: string;

  @Column({ nullable: true })
  shortIntro: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  website: string;

  @Column()
  contactName: string;

  @Column({ nullable: true })
  position: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  otherContactInfo: string;
}
