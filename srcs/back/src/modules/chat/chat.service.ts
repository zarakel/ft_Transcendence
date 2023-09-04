import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { databaseService } from '../database/database.service';
import { Message } from './message.entity';
import { ChatUsers } from './chatUsers.entity';
import { User } from '../user/user.entity';
import { friendService } from '../friend/friend.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export default class ChatService {
    @InjectRepository(Chat)
	public repository: Repository<Chat>

	@InjectRepository(ChatUsers)
	public repositorych: Repository<ChatUsers>

    private manager: EntityManager;
	constructor() {
        this.repository = databaseService.getDataSource().getRepository(Chat);
		this.repositorych = databaseService.getDataSource().getRepository(ChatUsers);
        this.manager = databaseService.getDataSource().manager;
    }

    async create(owner: number, token: string, name: string, users: number[], password: string, privacy: boolean, dm: any): Promise<Chat>
    {
        if (dm.bool)
        {
            let chat = await this.get_dm_chat(dm.user1, dm.user2);
            if (chat)
                return null;
        }
        if (await this.repository.findOneBy({name: name}))
            return null;
        let c = this.repository.create();
		c.owner = owner;
        c.name = name;
        c.token = token;
        c.password = password == undefined ? null : await bcrypt.hash(password, 10);
        c.is_private = privacy;
        if (dm.bool)
        {
            c.dm = true;
            c.user_1 = await this.get_user_id(dm.user1);
            c.user_2 = await this.get_user_id(dm.user2);
        }
        c = await this.repository.save(c);
        if (dm.bool)
        {
            await this.add_user(c.id, c.user_1);
            await this.add_user(c.id, c.user_2);
        }
        else
        {
            await this.add_user(c.id, owner);
            for (const id of users)
            {
                await this.add_user(c.id, id);
            }
        }
        return c;
    }

    async register_message(chat_id: number, sender: number, message: string)
    {
        let new_message = new Message();
        new_message.chat_id = chat_id;
        new_message.content = message;
        new_message.sender = sender;

        await this.manager.save(new_message);
    }

    async add_user(chat_id: number, user_id: number)
    {
        let link = await this.repositorych.findOneBy({chat_id: chat_id, user_id: user_id});
        let chat = await this.repository.findOneBy({id: chat_id})
        if (link)
        {
            if (link.leaved)
            {
                await this.repositorych.update({id: link.id}, {leaved: false, is_logged: chat.password == null});
                return true;
            }
            return false;
        }
        let new_link = this.repositorych.create();
        new_link.chat_id = chat_id;
        new_link.user_id = user_id;
        if (chat.password == null)
            new_link.is_logged = true;
        else
            new_link.is_logged = false;
        await this.repositorych.save(new_link);
        return true;
    }

    async send_pass(chat_id: number, user_id: number, password: string)
    {
        let chat = await this.repository.findOneBy({id: chat_id});
        let link = await this.repositorych.findOneBy({chat_id: chat_id, user_id: user_id})
        if (!chat.is_private)
            return true;
        if (link)
        {
            if (link.is_logged)
                return true;
        }
        if (!password || !chat.password)
            return false;
        const pass = await bcrypt.compare(password, chat.password)
        if (!pass)
            return false;
        await this.repositorych.update({id: link.id}, {is_logged: true});
        return true;
    }

    async kick_user(chat_id: number, user_id: number)
    {
        if (await this.is_admin(chat_id, user_id))
            return false;
        let link = await this.manager.findOneBy(ChatUsers, {chat_id: chat_id, user_id: user_id});
        if (!link || link.leaved)
            return -1;
        await this.repositorych.update({chat_id: chat_id, user_id: user_id}, {leaved: true, is_logged: false});
        return true;
    }

    async set_admin(chat_id: number, user_id: number, admin: boolean)
    {
        let l = await this.repositorych.findOneBy({chat_id: chat_id, user_id: user_id});
        if (!l || l.leaved)
            return false;
        await this.manager.update(ChatUsers, {chat_id: chat_id, user_id: user_id}, {is_admin: admin})
        return true;
    }

    async chat_update(user_id: number)
    {
        let chat = await this.get_all_chat();
        for (const c of chat)
        {
            if (!c.is_private)
            {
                let link = await this.repositorych.findOneBy({chat_id: c.id, user_id: user_id});
                if (!link)
                {
                    await this.add_user(c.id, user_id);
                }
            }
        };
    }

    async get_user_chats(user_id: number)
    {
        await this.chat_update(user_id);
        let ct = await databaseService.getDataSource().createQueryBuilder().select("C.id").addSelect("C.token").addSelect("C.password IS NOT NULL as passworded").addSelect("U.is_logged").addSelect("C.name as name").addSelect("C.dm").addSelect("C.user_1").addSelect("C.user_2").addSelect("C.is_private").from(Chat, "C").addFrom(ChatUsers, "U").where("C.id = U.chat_id").andWhere("U.user_id = :id", {id: user_id}).andWhere("U.leaved = :p", {p: false}).distinct(true).execute();
        return ct;
    }

    async get_chat_messages(chat_id: number, login: string)
    {
        let messages;

        messages = await databaseService.getDataSource().createQueryBuilder().select("M.id").orderBy("M.id", "ASC").addSelect("content").addSelect("M.sender").addFrom(Message, "M").addFrom(Chat, "C").where("C.token = :id", { id: chat_id }).andWhere("M.chat_id = C.id").distinct(true).execute();
        let users = await this.manager.find(User);
        let user = users.find(e => e.username == login);
        let blocked;
        if (user)
            blocked = await friendService.get_blocked(user.id);
        if (blocked)
        {
            messages.forEach((m) => {
                if (blocked.find((b) => {return (b.blocked_id == m.M_sender)}))
                    m.content = "Message bloqué";
            })
        }
        for (let i = 0; i < messages.length; i++)
        {
            if (messages[i].M_sender != -1)
                messages[i].U_username = users.find(e => e.id == messages[i].M_sender).username;
            else
                messages[i].U_username = null, messages[i].id = -1;
        }
        return messages;
    }

    async get_all_chat()
    {
        return await this.repository.find();
    }

    async get_chat_users(login: string, chat_id: number)
    {
        let users = await databaseService.getDataSource().createQueryBuilder().select("U.id as id").addSelect("U.username as username").addSelect("U.online as online").addSelect("U.ingame as ingame").addSelect("U.profile_pic as profile_pic").addFrom(User, "U").addFrom(ChatUsers, "L").addFrom(Chat, "C").where("U.login != :login", {login: login}).andWhere("C.token = :ci", {ci: chat_id}).andWhere("L.chat_id = C.id").andWhere("L.user_id = U.id").distinct(true).execute();
		for (let i = 0; i < users.length; i++)
		{
			let r = await friendService.get_infos(login, users[i].username);
			users[i].friend = r.friend != undefined;
			users[i].blocked = r.blocked != undefined;
		}
        return users;
    }

    async checkName(name: string)
    {
        return (await this.repository.findOneBy({name: name})) != undefined;
    }

    async set_chat_password(chat_id: number, password: string)
    {
        if (password == "" || password == undefined)
            password = null;
        await this.repository.update({id: chat_id}, {password: password == null ? null : await bcrypt.hash(password, 10)});
        if (password == null)
            await this.repositorych.update({chat_id: chat_id}, {is_logged: true});
        return true;
    }

    async is_admin(chat_id: number, user_id: number)
    {
        let chat = await this.repository.findOneBy({id: chat_id});
        let admin = await this.repositorych.findOneBy({chat_id: chat_id, user_id: user_id})
        if (!admin)
            return -1;
        if (chat.owner == user_id)
            return 2;
        if (admin.is_admin)
            return 1;
        return 0;
    }

    async set_mute(chat_id: number, user_id: number, mute: boolean)
    {
        if (await this.is_admin(chat_id, user_id))
            return false;
        let link = await this.repositorych.findOneBy({chat_id: chat_id, user_id: user_id});
        if (!link || link.leaved)
            return false;
        await this.repositorych.update({chat_id: chat_id, user_id: user_id}, {is_muted: mute});
        return true;
    }

    async set_banned(chat_id: number, user_id: number, banned: boolean)
    {
        if (await this.is_admin(chat_id, user_id))
            return false;
        let link = await this.repositorych.findOneBy({chat_id: chat_id, user_id: user_id});
        if (!link || link.leaved)
            return false;
        await this.repositorych.update({chat_id: chat_id, user_id: user_id}, {is_banned: banned});
        return true;
    }

    async is_mute(chat_id: number, user_id: number)
    {
        let link = await this.repositorych.findOneBy({chat_id: chat_id, user_id: user_id});
        if (link)
            return link.is_muted;
        return -1;
    }

    async is_ban(chat_id: number, user_id: number)
    {
        let link = await this.repositorych.findOneBy({chat_id: chat_id, user_id: user_id});
        if (link)
            return link.is_banned;
        return -1;
    }

    async leave(chat_id: number, user_id: number)
    {
        let link = await this.manager.findOneBy(ChatUsers, {chat_id: chat_id, user_id: user_id});
        if (!link || link.leaved)
            return -1;
        await this.repositorych.update({chat_id: chat_id, user_id: user_id}, {leaved: true, is_logged: false});
        return true;
    }

    async get_user_id(username: string)
    {
        if (username == undefined)
            return -1;
        let user = await this.manager.findOneBy(User, {username: username});
        if (user)
            return user.id;
        return -1
    }

    async get_dm_chat(user1: string, user2: string)
    {
        let u1 = await this.get_user_id(user1);
        let u2 = await this.get_user_id(user2);

        let chat = await this.manager.findOneBy(Chat, {user_1: u1, user_2: u2})
        if (chat)
            return chat;
        chat = await this.manager.findOneBy(Chat, {user_1: u2, user_2: u1})
        if (chat)
            return chat;
        return null;
    }
}
export const chatService = new ChatService();