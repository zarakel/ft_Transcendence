import { Socket } from "socket.io";

export default class Player
{
	public id: number;
	public socket: Socket;
	public username: string;
	public main_chat: string;
	public login: string;
	public pos: string;
	public rooms: Array<string>;
	public score: number;
	public mmr: number;

	constructor(id: number, socket: Socket, username: string, login: string){
		this.id = id;
		this.socket = socket;
		this.username = username;
		this.login = login;
		this.rooms = new Array();
	}

	public emit(event: string, data:any){
		this.socket.emit(event, data);
	}

	public on(event: string, data:any){
		this.socket.on(event, data);
	}

	public setMmr(mmr: number) {
		this.mmr = mmr;
	}

	public toJson(){
		return {id: this.id,
			username: this.username, 
			pos: this.pos}
	}
}