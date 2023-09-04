import { databaseService } from '../database/database.service'
import { User } from './user.entity'
import { Body, Controller, Post, Param, UseGuards, Request, Get } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';
import { friendService } from "../friend/friend.service"
import { userService } from './user.service';


@Controller('user')
export class UserController{

    @UseGuards(AuthGuard('jwt'))
    @Post('username_update')
    async username_update(@Body() body: any, @Request() req): Promise<string>
    {
        let ds = databaseService.getDataSource();
		const allowedChars = /^[A-Za-z]+$/;
        const new_username = body.username;

		if(!allowedChars.test(new_username) || new_username.length > 20)
			return JSON.stringify({boolean: false});

        try 
        {
            await ds.manager.update(User, {login: req.user.login}, {username: new_username})
            return JSON.stringify({boolean: true});
        }
        catch
        {
            return JSON.stringify({boolean: false});
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('picture_update')
    async picture_update(@Body() body: any, @Request() req): Promise<string>
    {
        let ds = databaseService.getDataSource();
        let user = await ds.manager.findBy(User, {login: req.user.login});
        user[0].profile_pic = body.profile_pic;
        try 
        {
            await ds.manager.save(user[0]);
            return JSON.stringify({boolean: true});
        }
        catch
        {
            console.error("echec picture_update");
            return JSON.stringify({boolean: false});
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('pad_update')
    async pad_update(@Body() body: any, @Request() req): Promise<string>
    {
        let ds = databaseService.getDataSource();
        try 
        {
            await ds.manager.update(User, {login: req.user.login}, {pad_color: body.new_color})
            return JSON.stringify({boolean: true});
        }
        catch (e)
        {
            return JSON.stringify({error: true, msg: e});
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('get_players')
    async get_players(@Request() req)
    {
        return await userService.get_players(req.user.login);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('get_profil/:login')
    async get_profil(@Param("login") login, @Request() req)
    {
        let ds = databaseService.getDataSource();
        let link = await friendService.get_infos(req.user.login, login);
        let user = await ds.manager.findOneBy(User, {username: login});
        if (!user)
            return JSON.stringify({error: true, message: "error_user_not_exist"})
        return JSON.stringify({id: user.id, username: user.username, profile_pic: user.profile_pic, mmr: user.mmr, win: user.win, lose: user.lose, level: user.level, is_friend: link.friend != undefined, is_blocked: link.blocked != undefined});
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('user_update/:id')
    async user_update(@Param('id') id: any): Promise<any>
    {
        let ds = databaseService.getDataSource();
        let user = await ds.manager.findOneBy(User, {id: id});
        if (user)
            return JSON.stringify({level: user.level, win: user.win, lose: user.lose, mmr: user.mmr});
        else
            return JSON.stringify({error: true, message: "error_user_not_exist"});
    }

}
