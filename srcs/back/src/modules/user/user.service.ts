import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Friend } from '../friend/friend.entity';
import { databaseService } from '../database/database.service';
import { friendService } from '../friend/friend.service';

@Injectable()
export default class UserService {
    @InjectRepository(User)
	public repository: Repository<User>
	constructor() {
        this.repository = databaseService.getDataSource().getRepository(User);
    }

	async getUser(id: number) {
		let u = this.repository.findOne({
			where: { id: id },
		  });
		if (u)
			return u;
	}

	async get_players(login: string)
	{
		let users = await databaseService.getDataSource().createQueryBuilder().select("U.id as id").addSelect("U.username as username").addSelect("U.online as online").addSelect("U.ingame as ingame").addSelect("U.login as login").from(User, "U").where("U.login != :login", {login: login}).execute();
		for (let i = 0; i < users.length; i++)
		{
			let r = await friendService.get_infos(login, users[i].username);
			users[i].friend = r.friend != undefined;
		}
		return users;
	}
}
export const userService = new UserService();