import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: "varchar", unique: true})
  token: string;

  @Column({type: 'int', nullable: true})
  id_left: number;

  @Column({type: 'int', nullable: true})
  id_right: number;

  @Column({type: 'int', default: 0})
  left_score: number;

  @Column({type: 'int', default: 0})
  right_score: number;

  @Column({type: "varchar", default: "none"})
  status: string;
}