import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Blocked {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({nullable: false})
    user_id: number;
  
    @Column({nullable: false})
    blocked_id: number;
}