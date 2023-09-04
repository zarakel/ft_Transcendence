import { databaseService } from '../database/database.service'
import { Game } from './game.entity'
import { User } from '../user/user.entity'
import { Controller, UseGuards, Get, Param } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';

@Controller('game')
export class GameController{
    @UseGuards(AuthGuard('jwt'))
    @Get('gameresults/:id')
    async game_results(@Param("id") id): Promise<any>
    {
        let ds = databaseService.getDataSource();
        const gameResults: any[] = [];
        const games = await ds.manager.find(Game);
        for (const game of games) {
            if (game.status != "deconnection" && (game.id_left == id || game.id_right == id))
            {
                const userLeft = await ds.manager.findOne(User, {where: {id: (game.id_left)}});
                const userRight = await ds.manager.findOne(User, {where: {id: (game.id_right)}});

                const gameForBack = {
                    user_left: userLeft.username,
                    user_right: userRight.username,
                    left_score: game.left_score,
                    right_score: game.right_score,
                    status: game.status,
                };
            
                gameResults.push(gameForBack);
            }
            };

    return JSON.stringify(gameResults);
    }
}