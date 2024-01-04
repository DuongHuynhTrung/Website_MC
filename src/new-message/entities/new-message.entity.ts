import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class NewMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  identifierUserChat: string;

  @Column({ default: true })
  isNew: boolean;
}
