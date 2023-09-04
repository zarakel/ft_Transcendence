import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from 'socket.io';
import GameRoom from "./room/GameRoom";
import Room from "./room/Room";
import LobbyRoom from "./room/LobbyRoom";
import ChatRoom from "./room/ChatRoom";
import Player from "./room/Player"
import { gameService } from "./modules/game/game.service";
import { chatService } from "./modules/chat/chat.service";
import { friendService } from "./modules/friend/friend.service";

@WebSocketGateway({
	cors: { origin: '*',}
})
export class AppGateway
{
	private users : Map<number, Player>;
	private gameRooms : Map<string, GameRoom>;
	private chatRooms : Map<string, ChatRoom>;
	private lobby: LobbyRoom;

	@WebSocketServer()
	public server: Server;
	public async afterInit(server: Server) {
		this.users = new Map();
		this.lobby = new LobbyRoom;
		this.lobby.setGateway(this);
		this.gameRooms = new Map();
		this.chatRooms = new Map();
		await this.createAllChats();
	}

	//connection
	public handleConnection(client: Socket){}

	//diconnect
	public handleDisconnect(client: Socket){
		this.users.forEach(async (p: Player, key: number) => {
			if (p.socket.id == client.id){
				await friendService.set_status(p.id, false);
				p.rooms.forEach((token: string) => {
					let room = null;
					if (token == "lobby")
						room = this.lobby;
					else if (this.gameRooms.has(token))
						room = this.gameRooms.get(token);
					else if (this.chatRooms.has(token))
						room = this.chatRooms.get(token);
					if (room)
						room.onleave(p);
				});
				this.users.delete(key);
			}
		});
	}

	//onUser connection
	@SubscribeMessage('connect_msg')
	public async onConnection(client: Socket, data: any){
		let user = this.users.get(data.sender.id);
		if (user == undefined)
		{
			let p =  new Player(parseInt(data.sender.id), client, data.sender.username, data.sender.login);
			p.setMmr(data.sender.mmr);
			this.users.set(data.sender.id, p);
			await friendService.set_status(data.sender.id, true);
		}
		else if (user.socket.id != client.id)
		{
			user.socket = client;
			await friendService.set_status(data.sender.id, true);
		}
	}

	@SubscribeMessage('goodbye')
	public async onDisconnection(client: Socket, data: any){
		this.users.forEach(async (p: Player, key: number) => {
			if (p.socket.id == client.id){
				await friendService.set_status(p.id, false);
				p.rooms.forEach((token: string) => {
					let room = null;
					if (token == "lobby")
						room = this.lobby;
					else if (this.gameRooms.has(token))
						room = this.gameRooms.get(token);
					else if (this.chatRooms.has(token))
						room = this.chatRooms.get(token);
					if (room)
						room.onleave(p);
				});
				this.users.delete(key);
			}
		});
	}

	//envoi d'un msg + mots clé d'action
	@SubscribeMessage('message')
	public onMessage(client: Socket, data: any){
		let player = this.users.get(data.sender.id);
		let room = this.getRoom(data.Roomtoken, data.RoomType);
		if (player && room)
			room.onMessage(data.type, player, data);
		else if (player && !room && data.RoomType == "chat" && data.type == "create"){
			this.onCreateChatRoom(client, data);
		}
		else
			client.emit("roomNotFound", data);
	}

	@SubscribeMessage('redirectChat')
	public async onRedirectChat(client: Socket, data: any){
		this.users.forEach((p) => {
			if (p.id != data.sender.id && p.id == data.otherUserId)
				p.emit('chat.redirectChat', data);
		});
	}

	private async onCreateChatRoom(client: Socket, data: any) 
	{
		let token = Math.random().toString(16).substring(2,10);
		if (data.dm.bool == false)
		{
			const allowedChars = /^[A-Za-z]+$/;
			let msg = "";
			if (!data.name || data.name == "")
				msg = "Name required"
			else if(await chatService.checkName(data.name))
				msg = "Chat name already used";
			else if (allowedChars.test(data.name) === false)
				msg = "Invalide format"
			else if (data.name.length > 10)
				msg = "Chat name are 10 char max";
			if (msg != "")
			{
				client.emit("ChatRoomCreated", {error: "true", msg: msg});
				return ;
			}
		}
		else
			data.name = data.name + "-" + token;
		let room = await this.createChatRoom(token, data.sender.id, data.users, data.password, data.privacy == "private", data.dm, data.name);
		if (room == null)
			return ;
		let id = room.getId();
		data.RoomId = id;
		data.Roomtoken = room.getToken();
		if (data.privacy == "public") {
			this.users.forEach((p) => {
				p.emit("ChatRoomCreated", data);
			});
		}
		else {
			client.emit("ChatRoomCreated", data);
			data.users.forEach(id => this.users.forEach((p) => {
				if (p.id == id)
					p.emit("ChatRoomCreated", data);
			}));
		}
	}

	@SubscribeMessage('createGame')
	public async createGameFriend(client: Socket, data: any){
		let p1 = this.getPlayer(data.sender.id);
		let p2 = this.getPlayer(data.challenger);
		let users = [p1, p2];
		if (p1 && p2) {
			let token = Math.random().toString(16).substring(2,10);
			this.createGameRoom(token, p1, p2).then(room => {
				[users[0], users[1]].forEach((p: Player) =>{
					let position = "spec";
					if (p == room.leftPlayer)
						position = "left";
					if (p == room.rightPlayer)
						position = "right";
					p.emit("invit.gameCreate", {
						sender: {id: p.id, username: p.username, pos: position},
						user1: users[0].id,
						user2: users[1].id,
						token: token
					});
				});
			});
		}
	}

	public async createGameRoom(token: string, p1: Player, p2: Player): Promise<GameRoom>{
		let game = await gameService.create(token);
		let gameRoom = new GameRoom(token, game);
		gameRoom.leftPlayer = p1;
		gameRoom.rightPlayer = p2;
		gameRoom.setGateway(this);
		this.gameRooms.set(token, gameRoom);
		return gameRoom;
	}

	public async createChatRoom(token: string, owner: number, users: number[], password: string, privacy: boolean, dm: any, name: string): Promise<ChatRoom> {
		let pass = password == "" ? null : password;
		let chat = await chatService.create(owner, token, name, users, pass, privacy, dm);
		if (chat == null)
			return null;
		let chatR = this.getChatRoom(chat.token);
		if (!chatR){
			chatR = new ChatRoom(token, chat);
		}
		this.chatRooms.set(token, chatR);
		return chatR;
	}

	private getRoom(token: string, type: string): Room{
		if (type == "lobby")
			return this.lobby;
		else if (type == "game")
			return this.gameRooms.get(token);
		else if (type == "chat")
			return this.chatRooms.get(token);
		else 
			return null;
	}

	private getChatRoom(token: string): ChatRoom {
		return this.chatRooms.get(token);
	}

	public getPlayer(id :number) {
		let player = null;
		this.users.forEach((p) => {
			if (p.id == id) {
				player = p;
				return ;
			}
		});
		return player;
	}

	public removeRoom(token: string){
		if (this.gameRooms.has(token))
			this.gameRooms.delete(token);
		if (this.chatRooms.has(token))
			this.chatRooms.delete(token);
	}

	private async createAllChats() {
		let chats = await chatService.get_all_chat();
		for (let c of chats){
			let token = c.token;
			this.chatRooms.set(token, new ChatRoom(token, c));
		}
	}
}