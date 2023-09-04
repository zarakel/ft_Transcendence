import { AppGateway } from "src/app.gateway";
import Player from "./Player";

export default abstract class Room
{
	protected id: number;
	protected token: string;
	protected users: Array<Player>
	protected gateway: AppGateway;
	protected waitMessage: Map<string, (player: Player, data: any) => any>;

	constructor(id: number, token: string)
	{
		this.id = id;
		this.token = token;
		this.users = new Array<Player>();
		this.waitMessage = new Map();
		this.onCreate();
	}

	public getId(): number{
		return this.id;
	}

	public getToken(): string{
		return this.token;
	}

	protected processMessage(type: string, callback: (player: Player, data: any) => any){
		this.waitMessage.set(type, callback);
	}

	public onMessage(type: string, player: Player, data: any){
		if (type == "join"){
			this.onJoin(player, data);
		}
		else if (type == "leave"){
			if (player.rooms)
				player.rooms = player.rooms.filter((room: string) => room != this.token);
			this.onleave(player);
		}
		if (this.waitMessage.has(type)){
			this.waitMessage.get(type)(player, data);
		}
	}

	public setGateway(gateway: AppGateway){
		this.gateway = gateway;
	}

	public abstract onCreate();
	public abstract onDestroy();
	public abstract onJoin(player: Player, data: any);
	public abstract onleave(player: Player);
}