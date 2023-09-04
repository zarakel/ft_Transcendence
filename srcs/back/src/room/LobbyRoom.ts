import Player from "./Player";
import Room from "./Room";

export default class LobbyRoom extends Room {

	constructor(){
		super(0, "lobby");
	}

	public onCreate() {
		setInterval(() => {
			let match = this.canMatch();
			if (match.res)
				this.createGame(match.p1, match.p2);
		}, 5000)
	}

	public onDestroy() {}
	public onJoin(player: Player, data: any) {
		if (!this.users.find(((p) => {
			if (p.id === player.id) return p;
		}))){
			player.rooms.push(this.token);
			this.users.push(player)
			//console.log(`user ${player.username} as join lobby`);
		}
		
	}
	public onleave(player: Player) {
		this.users = this.users.filter((p: Player) => p !== player);
		//console.log(`user ${player.username} as leave lobby`);
	}

	private async createGame(p1: Player, p2: Player){
		let token = Math.random().toString(16).substring(2,10);
		this.gateway.createGameRoom(token, p1, p2).then(room => {
				[p1, p2].forEach((p: Player) =>{
					let position = "spec";
					if (p == room.leftPlayer)
						position = "left";
					if (p == room.rightPlayer)
						position = "right";
					if (p) {
						p.emit("lobby.match", {
							sender: {id: p.id, username: p.username},
							token: token
						});
						this.onleave(p);
					}
				});
			});
	}

	private canMatch()
	{
		let min: number = 201;
		let u1, u2: Player;
		if (this.users.length < 2)
			return {res: false, p1: u1, p2: u2};
		for (const p of this.users)
		{
			for (const p2 of this.users)
			{
				if ((p.id != p2.id) && (min == null || Math.abs(p.mmr - p2.mmr) < min))
				{
					min = Math.abs(p.mmr - p2.mmr);
					u1 = p;
					u2 = p2;
				}
			}
		}
		if (min > 200)
			return {res: false, p1: u1, p2: u2};
		return {res: true, p1: u1, p2: u2};
	}

}