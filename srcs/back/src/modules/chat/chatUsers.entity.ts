import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChatUsers {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  chat_id: number;

  @Column({nullable: false})
  user_id: number;

  @Column({default: false})
  is_admin: boolean;

  @Column({default: false})
  is_muted: boolean;

  @Column({default: false})
  is_banned: boolean;

  @Column({default: false})
  is_logged: boolean;

  @Column({default: false})
  leaved: boolean;
}
