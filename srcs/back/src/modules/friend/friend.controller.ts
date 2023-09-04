import { Controller, Post, UseGuards, Request, Param } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';
import { friendService } from './friend.service';



@Controller('friend')
export class FriendController{

    @UseGuards(AuthGuard('jwt'))
    @Post('add/:login')
    async add_user(@Param("login") login, @Request() req): Promise<string>
    {
        let res = await friendService.add_user(req.user.login, login);
        if (res == -1)
            return JSON.stringify({error: true, message: "User does not exist"});
        if (res == 0)
            return JSON.stringify({error: false, message: "Friend added"});
        if (res == 1)
            return JSON.stringify({error: false, message: "Friend removed"});
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('block/:login')
    async block_user(@Param("login") login, @Request() req): Promise<string>
    {
        let res = await friendService.block_user(req.user.login, login)
        if (res == -1)
            return JSON.stringify({error: true, message: "User does not exist"});
        if (res == 0)
            return JSON.stringify({error: false, message: "User blocked"});
        if (res == 1)
            return JSON.stringify({error: false, message: "User unblocked"});
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('info/:login')
    async user_relation(@Param("login") login, @Request() req): Promise<string>
    {
        let i = await friendService.get_infos(req.user.login, login);
        if (i.error)
            return JSON.stringify({error: true});
        return JSON.stringify({error: false, friend: i.friend != undefined, blocked: i.blocked != undefined});
    }


}