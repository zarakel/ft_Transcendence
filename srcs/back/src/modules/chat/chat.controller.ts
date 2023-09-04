
import { chatService } from './chat.service'
import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/user.entity';
import { databaseService } from '../database/database.service';
import { Chat } from './chat.entity';
import { ChatUsers } from './chatUsers.entity';
import { Message } from './message.entity';


@Controller('chat')
export class ChatController{

    @UseGuards(AuthGuard('jwt'))
    @Get('user_chats')
    async get_user_chats(@Request() req): Promise<string>
    {
        let ds = databaseService.getDataSource();
        let user = await ds.manager.findOneBy(User, {login: req.user.login});
        if (!user)
            return JSON.stringify({message: "error user", boolean: false});
        let chats = await chatService.get_user_chats(user.id);
        if (!chats)
            return JSON.stringify({message: "error chats", boolean: false});
        for (let i = 0; i < chats.length; i++)
        {
            if (chats[i].C_dm)
            {
                let u1 = await ds.manager.findOneBy(User, {id: chats[i].C_user_1});
                let u2 = await ds.manager.findOneBy(User, {id: chats[i].C_user_2});
                chats[i].C_user_1 = u1.username;
                chats[i].C_user_2 = u2.username;
            }
        }
        return JSON.stringify(chats);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('chat_messages')
    async get_chat_messages(@Body() body, @Request() req): Promise<string>
    {
        let messages = await chatService.get_chat_messages(body.chat_id, req.user.login);
        let users = await chatService.get_chat_users(req.user.login, body.chat_id);
		if (!messages || !users)
            return JSON.stringify({message: "error messages", error: true});
        return JSON.stringify({m: messages, u: users});
    }
}