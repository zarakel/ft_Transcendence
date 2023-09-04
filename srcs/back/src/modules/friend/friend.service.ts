import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { databaseService } from '../database/database.service';
import { User } from '../user/user.entity';
import { Blocked } from './blocked.entity';
import { Friend } from './friend.entity';

@Injectable()
export default class FriendService {
    @InjectRepository(Friend)
	public frepository: Repository<Friend>

    @InjectRepository(Blocked)
	public brepository: Repository<Blocked>

    private manager: EntityManager;

	constructor() {
        this.frepository = databaseService.getDataSource().getRepository(Friend);
        this.brepository = databaseService.getDataSource().getRepository(Blocked);
        this.manager = databaseService.getDataSource().manager;
    }

    async add_user(login: string, flogin: string)
    {
        let friend_id = await this.manager.findOneBy(User, {username: flogin})
        let user = await this.manager.findOneBy(User, {login: login});
        if (!user || !friend_id)
            return -1;
        let link = await this.frepository.findOneBy({user_id: user.id, friend_id: friend_id.id})
        if (link)
        {
            await this.frepository.remove(link);
            return 1;
        }
        let friend = await this.frepository.create();
    
        friend.friend_id = friend_id.id;
        friend.user_id = user.id;
        await this.frepository.save(friend);
        return 0;
    }

    async block_user(login: string, flogin: string)
    {
        let friend = await this.manager.findOneBy(User, {username: flogin})
        let user = await this.manager.findOneBy(User, {login: login});
        if (!user || !friend)
            return -1;
        let link = await this.brepository.findOneBy({user_id: user.id, blocked_id: friend.id})
        if (link)
        {
            await this.brepository.remove(link);
            return 1;
        }
        let newlink = await this.brepository.create();
    
        newlink.blocked_id = friend.id;
        newlink.user_id = user.id;
        await this.brepository.save(newlink);
        return 0;
    }

    async get_infos(login: string, flogin: string)
    {
        let friend = await this.manager.findOneBy(User, {username: flogin});
        let user = await this.manager.findOneBy(User, {login: login});

        if (!user || !friend)
            return {error: true};

        let f = await this.frepository.findOneBy({user_id: user.id, friend_id: friend.id});
        let b = await this.brepository.findOneBy({user_id: user.id, blocked_id: friend.id});

        return {error: false, friend: f, blocked: b};
    }

    async get_blocked(id: number)
    {
        return await this.brepository.findBy({user_id: id});
    }
    
    async set_status(user_id: number, s: boolean)
    {
        await this.manager.update(User, {id: user_id}, {online: s});
    }

    async set_game_status(id: number, s: boolean)
    {
        await this.manager.update(User, {id: id}, {ingame: s});
    }
}
export const friendService = new FriendService();