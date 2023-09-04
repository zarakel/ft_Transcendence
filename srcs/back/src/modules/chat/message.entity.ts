import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  chat_id: number;

  @Column({nullable: false})
  sender: number;

  @Column({type: "varchar"})
  content: string;
}