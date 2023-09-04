import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: "varchar", unique: true})
  username: string;

  @Column({type: "varchar", unique: true})
  login: string;

  @Column()
  profile_pic: string;

  @Column({default: "#ffffff"})
  pad_color: string;

  @Column({type: 'int', default: 500})
  mmr: number; 

  @Column({type: 'int', default: 0})
  level: number;

  @Column({type: 'int', default: 0})
  win: number;

  @Column({type: 'int', default: 0})
  lose: number;

  @Column()
  tfa_secret: string;

  @Column({default: false})
  tfa_enable: boolean;

  @Column({default: false})
  online: boolean;

  @Column({default: false})
  ingame: boolean;
}