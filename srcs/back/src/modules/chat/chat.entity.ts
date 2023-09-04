import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: "varchar", nullable: false, unique: true})
  token: string;

  @Column({type: "varchar", nullable: false, unique: true})
  name: string;

  @Column({type: "varchar", default: null})
  password: string;

  @Column({default: true})
  is_private: boolean;

  @Column({nullable: false})
  owner: number;

  @Column({default: false})
  dm: boolean;

  @Column({default: null})
  user_1: number;

  @Column({default: null})
  user_2: number;
}