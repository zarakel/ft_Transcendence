import { DataSource, DataSourceOptions } from 'typeorm';
import { LoginService } from '../login/login.service';
import { User } from '../user/user.entity';
import { Game } from '../game/game.entity';
import { Chat } from '../chat/chat.entity';
import { ChatUsers } from '../chat/chatUsers.entity';
import { Message } from '../chat/message.entity';
import { Friend } from '../friend/friend.entity';
import { Blocked } from '../friend/blocked.entity';

class DatabaseService 
{
    private dataSource: DataSource;

    constructor() {
        this.dataSource = new DataSource(this.getConfig());
        this.dataSource.initialize();
    }

    public getConfig(): DataSourceOptions
    {
        return {
            type: 'postgres',
            host: 'postgresql',
            port: 5432,
            username: 'toto',
            password: 'toto',
            database: 'transcendence',
            entities: [User, Game, Chat, ChatUsers, Message, Friend, Blocked]
        };
    }

    public getDataSource(): DataSource
    {
        return this.dataSource;
    }

    public async insertUser(user: any, login_service: LoginService): Promise<any>
    {
        const newUser = new User();
        newUser.login = user.login;
        newUser.username = user.login;
        const image = await fetch(user.image.versions.small);
        newUser.profile_pic = Buffer.from(await image.arrayBuffer()).toString('base64');
        newUser.tfa_secret = login_service.generateTFASecret();
        newUser.tfa_enable = false;

        await this.dataSource.manager.save(newUser);
        return newUser;
    }
}

export const databaseService = new DatabaseService();