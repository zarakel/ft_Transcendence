import { Game } from "src/modules/game/game.entity";
import Player from "./Player"
import Room from "./Room";
import { gameService } from "src/modules/game/game.service";
import { databaseService } from "src/modules/database/database.service";;
import { friendService } from "src/modules/friend/friend.service";
import { User } from "src/modules/user/user.entity";
import { userService } from "src/modules/user/user.service";

export const PONG_W: number = 600;
export const PONG_H: number = 400;
export const PLAYER_W: number = 10;
export const PLAYER_H: number = PONG_H / 3;
export const STANDARD_BALL_SPEED = 2;
export const ACCEL_BALL = 1.1;
export const MAX_SPEED = 12;
export const MAX_POINT = 5;
export const STARTED = "started";
export const FINISH = "finish";
export const WAITING = "waiting";
export const DECO = "deconnection";
export const REFUSED = "refused";

export default class GameRoom extends Room
{
	public leftPlayer: Player;
	public rightPlayer: Player;
	private rightP: boolean = false;
	private leftP: boolean = false;
	private game: Game;
	private lp: any = {y: PONG_H / 2 - PLAYER_H / 2, x: 0}
	private rp: any = {y: PONG_H / 2 - PLAYER_H / 2, x: PONG_W - PLAYER_W}
	private ball: any = {y: PONG_H / 2, x: PONG_W / 2, 
		dx: Math.round(Math.random()) * 2 - 1, dy: Math.round(Math.random()) * 2 - 1,
		r: 5, s: STANDARD_BALL_SPEED};
	public started: boolean = false;
	public status: string = "none";
	
	constructor(token: string, game: Game)
	{
		super(game.id, token);
		this.game = game;
		this.status = WAITING;
	}

	public onJoin(player: Player, data: any) {
		if (player.id === this.leftPlayer.id){
			player.pos = "left";
			this.leftP = true;
		}
		else if (player.id === this.rightPlayer.id){
			player.pos = "right";
			this.rightP = true;
		}
		else
			player.pos = "spec";
		let inter = setInterval(() => {
			if (!this.leftP || !this.rightP)
				this.stop("TIMEOUT");
			clearInterval(inter);
		}, 15000);
		player.score = 0;
		if (this.users.find((p: Player) => {if (p.id === player.id) return p;}) === undefined){
			player.rooms.push(this.token);
			this.users.push(player);
			this.users.forEach(p => {
				data.sender.pos = p.pos;
				p.emit("game.join", {sender: data.sender, token: this.token});
			});
			if (this.leftP && this.rightP){
				friendService.set_game_status(this.leftPlayer.id, true);
				friendService.set_game_status(this.rightPlayer.id, true);
				this.countDown();
			}
			//console.log(`player: ${player.username} join: ${this.id} pos: ${player.pos}`)
		}
	}

	public async onleave(player: Player) {
		let p = false;
		if (this.leftP && player.id === this.leftPlayer.id)
			this.leftP = false, p = true, await friendService.set_game_status(this.leftPlayer.id, false);
		else if (this.rightP && player.id === this.rightPlayer.id)
			this.rightP = false, p = true, await friendService.set_game_status(this.rightPlayer.id, false);
		this.users = this.users.filter((p: Player) => p !== player)
		player.rooms.filter((value: string) => value !== this.token);
		if (this.status == WAITING && p){
			this.stop(REFUSED);
		}
		//console.log(`player ${player.username} leaved ${this.id}`)
	}

	public onCreate() {
		this.processMessage("movePaddle", (player: Player, data: any) => {
			data.sender.y = data.sender.y / PONG_H;
			if (data.sender.pos === "left") { this.lp.y = data.sender.y; }
			if (data.sender.pos === "right"){ this.rp.y = data.sender.y; }
			this.users.forEach(p => {
				if (p.id !== player.id) {
					p.emit("game.move", data);
				}
			});
		});
	}

	public onDestroy() {
		this.gateway.removeRoom(this.token);
	}

	private async countDown() {
		this.users.forEach(async (p) => {p.emit("game.starting", await this.getGamePlayers())})
		let count = 3;
		let inter = setInterval(() => {
			count--;
			this.users.forEach(p => p.emit("game.count", {id: this.token, count: count}))
			if (count < 0) {
				clearInterval(inter);
				this.start();
			}
		}, 1000);
	}

	private async start() {
		this.leftPlayer.score = 0;
		this.rightPlayer.score = 0;
		this.game.id_left = this.leftPlayer.id;
		this.game.id_right = this.rightPlayer.id;
		this.started = true;
		this.users.forEach(p => p.emit("game.start", {id: this.token, sender: p.toJson()}));
		await this.update();
		await this.changeStatus(STARTED);
		//console.log(`game: ${this.token} start`);
	}

	private async stop(expt: string) {
		let winner = this.leftPlayer;
		let loser = this.rightPlayer;
		if ((this.rightPlayer.score > this.leftPlayer.score) || !this.leftP) {
			winner = this.rightPlayer;
			loser = this.leftPlayer;
		}
		this.users.forEach(p => {
		p.emit("game.stop", {id: this.token, winner: winner.id, loser: loser.id,
			expt: expt})
		});
		this.game.left_score = this.leftPlayer.score;
		this.game.right_score = this.rightPlayer.score;
		this.started = false;
		if (expt === DECO)
			await this.changeStatus(DECO);
		else if (expt === FINISH)
		{
			let repo = databaseService.getDataSource();
			await repo.createQueryBuilder().update(User).set({win: () => "win + 1", level: () => "level + 1", mmr: () => "mmr + 10"}).where({id: winner.id}).execute();
			await repo.createQueryBuilder().update(User).set({lose: () => "lose + 1", level: () => "level + 1", mmr: () => "mmr - 10"}).where({id: loser.id}).execute();
			winner.mmr += 10;
			loser.mmr -= 10;
			await this.changeStatus(FINISH);
		}
		this.onleave(winner);
		this.onleave(loser);
		this.onDestroy();
	}

	private reset() {
		this.ball = {y: PONG_H / 2, x: PONG_W / 2, 
		dx: Math.round(Math.random()) * 2 - 1, dy: Math.round(Math.random()) * 2 - 1,
		r: 5, s: STANDARD_BALL_SPEED};
	}

	private collide(player: any, ball: any) {
		if (ball.x + this.ball.r >= player.x && ball.x - this.ball.r <= player.x + PLAYER_W &&
            ball.y + this.ball.r >= player.y && ball.y - this.ball.r <= player.y + PLAYER_H)
			{
				this.ball.s *= ACCEL_BALL;
				this.ball.dx = -this.ball.dx;
				return true;
			}
		return false;
	}

	private async update() {
		let col = false;
		if (this.ball.y + this.ball.r > PONG_H || this.ball.y - this.ball.r < 0) {
			this.ball.s *= ACCEL_BALL;
			this.ball.dy = -this.ball.dy;
		}
		if (this.ball.x <= PLAYER_W) {
			if (!this.collide(this.lp, this.ball)) {
				col = true; 
				this.rightPlayer.score++;
				if (this.rightPlayer.score == MAX_POINT )
					this.stop(FINISH);
			}
		}
		else if (this.ball.x >= PONG_W - PLAYER_W) {
			if (!this.collide(this.rp, this.ball)) {
				col = true; 
				this.leftPlayer.score++;
				if (this.leftPlayer.score == MAX_POINT)
					this.stop(FINISH);
			}
		}
		if (col) {
			this.users.forEach(p => p.emit("game.goal", {id: this.token,
				lscore: this.leftPlayer.score, rscore: this.rightPlayer.score}));
			this.reset();
		}

		if (!this.leftP || !this.rightP)
			this.stop(DECO);
			
		if (this.ball.s >= MAX_SPEED)
			this.ball.s = MAX_SPEED;
	
		this.ball.x += this.ball.dx * this.ball.s;
		this.ball.y += this.ball.dy * this.ball.s;

		this.users.forEach(p => p.emit("game.update", {id: this.token, 
			x: this.ball.x / PONG_W, y: this.ball.y / PONG_H}));
		
		if (this.started)
			setTimeout(()=> {
				if (this.leftPlayer.score < MAX_POINT || this.rightPlayer.score < MAX_POINT)
				this.update();
			}, 20);		
	}

	private async changeStatus(sta: string){
		this.status = sta;
		this.game.status = sta;
		await gameService.update(this.game)
	}

	private async getGamePlayers(){
		let p1 = await userService.getUser(this.leftPlayer.id);
		let p2 = await userService.getUser(this.rightPlayer.id);
		return {player1: {id: p1.id, username: p1.username, color: p1.pad_color}, player2: {id: p2.id, username: p2.username, color: p2.pad_color}}
	}
}