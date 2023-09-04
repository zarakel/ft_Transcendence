import { Chat } from "src/modules/chat/chat.entity";
import Player from "./Player"
import Room from "./Room";
import { chatService } from "src/modules/chat/chat.service";
import { friendService } from "src/modules/friend/friend.service";

export default class ChatRoom extends Room
{
	private c: Chat;

	constructor(token: string, chat: Chat)
	{
		super(chat.id, token);
		this.c = chat;
	}

	public async onJoin(player: Player, data: any) 
	{
		player.main_chat = this.token;
		if (this.users.find((p: Player) => {if (p.id === player.id) return p;}) === undefined) {
			let status = "wrongPassword"
			let pass = await chatService.send_pass(this.id, player.id, data.password)
			if (pass) {
				this.users.push(player);
				player.rooms.push(this.token);
				status = "OK";
				//console.log(`player ${player.username} join ${this.token}`);
			}
			player.emit("chat.joinResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status});
		}
	}

	public onleave(player: Player) {
		this.users = this.users.filter((p: Player) => p !== player);
		player.rooms.filter((value: string) => value !== this.token);
		//console.log(`player ${player.username} leaved ${this.token}`);
	}

	public onCreate() {
		this.processMessage("chatmsg", async (player: Player, data: any) => {
			if (data.Roomtoken != this.token)
				return ;
			if (this.users.find((p: Player) => {if (p.id === player.id) return p;}) !== undefined)
			{
				let m = await chatService.is_mute(this.id, player.id);
				if (m == false) {
					for (const p of this.users)
					{
						if (p.main_chat != this.token)// 1 chat la <------------------------------------ Il a gagné
							continue ;
						let b = await friendService.get_infos(p.login, player.username);
						if (b.blocked)
						{
							let tmp = data.msg;
							data.msg = "Message bloqué"
							p.emit("chat.msg", data);
							data.msg = tmp;
						}
						else
							p.emit("chat.msg", data);
					}
					await chatService.register_message(this.id, player.id, data.msg);
				}
			}
		});
		this.processMessage("changePassword", async (player: Player, data: any) => {
			let status = "error";
			let msg = "you are not owner";
			if (!this.c.is_private)
				msg = "Can't change password in public chat."
			else if (this.c.dm)
				msg = "Can't change password in direct message chat."
			else if (await chatService.is_admin(this.id, player.id) == 2) {
				if (await chatService.set_chat_password(this.id, data.newPassword))
					status = "OK", msg = "password has been changed";
				else
					msg = "error when password change";
			}
			player.emit("chat.changePasswordResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status, msg: msg});
		});
		this.processMessage("mute", async (player: Player, data: any) => {
			let status = "error";
			let msg = "you are not admin";
			if (data.user == undefined)
			msg = "Usage : /mute USERNAME"
			else if (this.c.dm)
				msg = "Can't mute user in direct message chat."
			else if (await chatService.is_admin(this.id, player.id)) {
				let id = await chatService.get_user_id(data.user);
				if (id != -1) 
				{
					let m = await chatService.is_mute(this.id, id);
					if (m == -1)
						msg = `${data.user} isn't in chat`
					else if (await chatService.set_mute(this.id, id, !m))
						status = "OK", msg = `${data.user} ${m ? "un" : ""}mute from chat`;
					else
						msg = `${data.user} cannot be mute`;
				}
				else
					msg = "user does not exist";
			}			
			if (status == "OK")
			{
				await chatService.register_message(this.id, -1, msg);
				this.emitAll("chat.muteResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status, msg: msg});
			}
			else
				player.emit("chat.muteResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status, msg: msg});

		});
		this.processMessage("kick", async (player: Player, data: any) => {
			let status = "error";
			let msg = "you are not admin";
			let id = await chatService.get_user_id(data.user);
			if (data.user == undefined)
			msg = "Usage : /kick USERNAME"
			else if (this.c.dm)
				msg = "Can't kick user in direct message chat."
			else if (await chatService.is_admin(this.id, player.id)) {
				if (id != -1) {
					let kick = await chatService.kick_user(this.id, id);
					if (kick == -1)
						msg = `${data.user} isn't in chat`
					else if (kick)
						status = "OK", msg = `${data.user} kick from chat`;
					else
						msg = `${data.user} cannot be kick`;
				}
				else
					msg = "user does not exist";
			}
			if (status == "OK")
			{
				await chatService.register_message(this.id, -1, msg);
				this.emitAll("chat.kickResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status, msg: msg});
				this.onleave(this.users.find((p: Player) => {if (p.id === id) return p;}))
			}
			else
				player.emit("chat.kickResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status, msg: msg});
		});
		this.processMessage("add", async (player: Player, data: any) => {
			let status = "error";
			let msg = "you are not admin";
			if (data.user == undefined)
			msg = "Usage : /add USERNAME"
			else if (this.c.dm)
				msg = "Can't add user in direct message chat."
			else if (await chatService.is_admin(this.id, player.id)) {
				let id = await chatService.get_user_id(data.user);
				if (id != -1) {
					if (await chatService.add_user(this.id, id))
						status = "OK", msg = `${data.user} add to chat`;
					else
						msg = `${data.user} already here`;
				}
				else
					msg = "user does not exist";
			}
			if (status == "OK")
			{
				await chatService.register_message(this.id, -1, msg);
				this.emitAll("chat.addResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status, msg: msg});
			}
			else
				player.emit("chat.addResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status, msg: msg});
		});
		this.processMessage("ban", async (player: Player, data: any) => {
			let status = "error";
			let msg = "you are not admin";
			if (data.user == undefined)
			msg = "Usage : /ban USERNAME"
			else if (this.c.dm)
				msg = "Can't ban user in direct message chat."
			else if (await chatService.is_admin(this.id, player.id)) {
				let id = await chatService.get_user_id(data.user);
				if (id != -1) {
					let b = await chatService.is_ban(this.id, id);
					if (b == -1)
						msg = `${data.user} isn't in chat`
					else if (await chatService.set_banned(this.id, id, !b))
						status = "OK", msg = `${data.user} has been banned`;
					else
						msg = `${data.user} cannot be ban`;
				}
				else
					msg = "user does not exist";
			}
			if (status == "OK")
			{
				await chatService.register_message(this.id, -1, msg);
				this.emitAll("chat.banResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status, msg: msg});
			}
			else
				player.emit("chat.banResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status, msg: msg});
		});
		this.processMessage("setadmin", async (player: Player, data: any) => {
			let status = "error";
			let msg = "you are not admin";
			let id = -1;
			let ad = await chatService.is_admin(this.id, player.id);
			if (data.user == undefined)
				msg = "Usage : /setadmin USERNAME"
			else if (this.c.dm)
				msg = "Can't set admin in direct message chat."
			else if (ad > 0) {
				id = await chatService.get_user_id(data.user);
				if (id != -1) {
					let a = await chatService.is_admin(this.id, id);
					if (id == player.id && ad == 2)
						msg = "Owner can't do that"
					else if (a == -1)
						msg = `${data.user} isn't in chat`
					else
					{
						if (ad == 1)
							msg = "You need to be owner"
						else
						{
							await chatService.set_admin(this.id, id, !a)
							status = "OK", msg = `${data.user} is ${a == 0 ? "now" : "no longer"} admin`;
						}
					}
				}
				else
					msg = "user does not exist";
			}
			if (status == "OK")
			{
				await chatService.register_message(this.id, -1, msg);
				this.emitAll("chat.setadminResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status, msg: msg});
			}
			else
				player.emit("chat.setadminResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: status, msg: msg});
		});
		this.processMessage("leaveChat", async (player: Player, data: any) => {
			if (this.c.dm)
				player.emit("chat.leaveResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: "error", msg: "Can't leave a direct message chat."});
			else 
			{
				let msg = `${data.sender.username} leaved the chat`;
				await chatService.register_message(this.id, -1, msg);
				await chatService.leave(this.id, player.id);
				this.emitAll("chat.leaveResult", {sender: data.sender, Roomtoken: data.Roomtoken, RoomType: "chat", status: "OK", msg: msg});
				this.onleave(player);
			}
		});
	}

	private emitTwo(player: Player, other: number, event: string, data: any){
		let p = this.gateway.getPlayer(other);
		if (p)
			p.emit(event, data);
		player.emit(event, data);
	}

	private emitAll(event: string, data: any) {
		this.users.forEach((p) => {
			p.emit(event, data);
		})
	}

	public onDestroy() {
		this.gateway.removeRoom(this.token);
	}
}