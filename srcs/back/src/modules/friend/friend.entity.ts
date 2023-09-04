import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Friend {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    user_id: number;
  
    @Column({nullable: false})
    friend_id: number;
}