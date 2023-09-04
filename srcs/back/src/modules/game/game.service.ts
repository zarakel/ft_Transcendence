import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './game.entity';
import { databaseService } from '../database/database.service';

@Injectable()
export default class GameService {
    @InjectRepository(Game)
	public repository: Repository<Game>
	constructor() {
        this.repository = databaseService.getDataSource().getRepository(Game);
    }

    async create(token: string): Promise<Game>
    {
        let g = this.repository.create({token: token});
        g = await this.repository.save(g);
        return g;
    }

    async update(game: Game)
    {
        return await this.repository.update(
            game.id, {
            token: game.token,
            id_right: game.id_right,
            id_left: game.id_left,
            right_score: game.right_score,
            left_score: game.left_score,
            status: game.status
        });
    }
}
export const gameService = new GameService();