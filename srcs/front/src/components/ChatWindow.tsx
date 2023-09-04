import { Key, useEffect, useRef, useState} from "react"
import { Link } from "react-router-dom";
import styles from "../styles/chat.module.scss";
import { useAppContext } from "./AppContext";

function useHorizontalScroll() { 
	const elRef = useRef();
	useEffect(() => {
	  const el: any = elRef.current;
	  if (el) {
		const onWheel = (e: any) => {
		  if (e.deltaY == 0) return;
		  e.preventDefault();
		  el.scrollTo({
			left: el.scrollLeft + e.deltaY,
			behavior: "auto"
		  });
		};
		el.addEventListener("wheel", onWheel);
		return () => el.removeEventListener("wheel", onWheel);
	  }
	}, []);
	return elRef;
  }

function useScrollAuMax() {
	const chat = useRef();
	useEffect(() => {
		const c: any = chat.current;
		if (c)
			c.scrollTop = c.scrollHeight;
	});
	return chat;
}


const ChatWindows = (Props: any) => {
	const [logged, setLogged] = useState(false);
	const [inputPassword, setInputPassword] = useState(false);
	const [token, setToken] = useState("");
	const { socket } = useAppContext();
	const inputText: any = useRef(null);
	const errormsg = useRef<HTMLLabelElement>(null);
	const [btnChat, setbtnChat] = useState<HTMLButtonElement>();
	const inputPasswordChat = useRef<HTMLInputElement>(null);
	const scrollRef: any = useHorizontalScroll();
	const chat: any = useScrollAuMax();
	const [channelToken, setChannelToken] = useState("");
	
	useEffect(() => {
		socket.on("chat.joinResult", (data: any) => {	
			if (Props.state.user.id != data.sender.id)
				return ;
			if (data.status == "OK"){
				setInputPassword(false);
				setLogged(true);
				Props.state.getChannel();
				Props.state.setMainChat(data.Roomtoken);
				if (Props.state.choseToken != "")
					Props.state.setChoseToken("");
				Props.state.getMsg(data.Roomtoken);
			}
			else {
				setInputPassword(true);
				setLogged(false);
				if (errormsg.current && inputPasswordChat.current){
					errormsg.current.textContent = data.status;
					inputPasswordChat.current.value = "";
				}
			}
		});
	}, [socket.ready]);

	useEffect(() => {
		if (Props.state.newUser)
			Props.state.getMsg(Props.state.mainChat)
	}, [Props.state.newUser])

	

	const changeChat = (token: string) => {
		setInputPassword(false);
		if (errormsg.current)
			errormsg.current.textContent = "";
		setToken(token);
		Props.state.setMsg([]);
		Props.state.setUsersChat([]);
		let islogged = false;
		let passworded = false;
		let dm = false;
		Props.state.chats.forEach((c: any) => {
			if (c.C_token == token) {
				islogged = c.is_logged;
				passworded = c.passworded;
				dm = (c.C_dm);
			}
		});
		if (dm || islogged || !passworded) {
			Props.state.setMainChat(token);
			Props.state.getMsg(token);
			setLogged(true);
			socket.emit("message", {sender :
				{id: Props.state.user.id ,username: Props.state.user.username
				}, Roomtoken: token, RoomType: "chat", type: "join"});
				setToken("");
		}
		else{
			setLogged(false);
			setInputPassword(true);
		}
	};

	const cmd = (cmds: string[]) => {
		let cmd = null;
		switch (cmds[0]) {
			case "/add":
				cmd = "add";
				break;
			case "/pass":
				let pass = cmds[1] == undefined || cmds[1] == "" ? null : cmds[1];
				socket.emit("message", {sender:
					{id: Props.state.user.id ,username: Props.state.user.username
					}, Roomtoken: Props.state.mainChat, RoomType: "chat", type: "changePassword", newPassword: pass});
				break;
			case "/kick":
				cmd = "kick";
				break;
			case "/mute":
				cmd = "mute";
				break;
			case "/leave":
				socket.emit("message", {sender :
					{id: Props.state.user.id ,username: Props.state.user.username
					}, Roomtoken: Props.state.mainChat, RoomType: "chat", type: "leaveChat"});
				break;
			case "/setadmin":
				cmd = "setadmin";
				break;
			case "/ban":
				cmd = "ban";
				break;
			default:
				if (errormsg.current)
					errormsg.current.textContent = "incorrect cmd";
				break;
		}
		if (cmd != null && cmds[1] != "") {
			socket.emit("message", {sender :
				{id: Props.state.user.id ,username: Props.state.user.username
				}, Roomtoken: Props.state.mainChat, RoomType: "chat", type: cmd, user: cmds[1]});
		}
	}

	const sendText = () => {
		if (errormsg.current)
					errormsg.current.textContent = "";
		if (inputText.current) {
			let text = inputText.current.value;
			if (text[0] == '/'){
				cmd(text.split(' '));
			}
			else if (text != "") {
				socket.emit("message", {sender :
					{id: Props.state.user.id ,username: Props.state.user.username
					}, Roomtoken: Props.state.mainChat, RoomType: "chat", type: "chatmsg", msg: inputText.current.value});
			}
			inputText.current.value = "";
		}
	}

	const sendPassword = () => {
		if (inputPasswordChat.current && errormsg.current) {
			let pass = inputPasswordChat.current.value == "" ? null : inputPasswordChat.current.value;
			errormsg.current.textContent = "";
			socket.emit("message", {sender :
				{id: Props.state.user.id ,username: Props.state.user.username
				}, Roomtoken: token, RoomType: "chat", type: "join", password: pass});
			inputPasswordChat.current.value = "";
			//setLogged(true);
		}
	}

	const msgWho = (value: any) => {
		let username = value.U_username;
		let me = styles.chat_msg_me;
		let other = styles.chat_msg_other;
		let cmd = styles.chat_msg_console;
		if (Props.state.user.username == username)
			return me;
		else if (value.id == -1)
			return cmd;
		else
			return other;
	}

	const chatWho = (value: any) => {
		if (value.C_dm)
			return styles.chatOngletBtnDm;
		if (value.C_is_private)
			return styles.chatOngletBtnPrivate;
		return styles.chatOngletBtnPublic;
	}


	const onClickBtn = (e: any) => {
		if (btnChat){
			btnChat.className = btnChat.className.split(" ")[0];
		}
		e.target.className = e.target.className + " " + styles.selected;
		setbtnChat(e.target);
		changeChat(e.target.value);
	};

	return (
	<div className={styles.chatWindow}>
		<div ref={scrollRef} className={styles.chatWindowOnglet}>
			{!Props.state.chats.message && Props.state.chats.map((value: any, index: Key) => 
				<button key={index} onClick={(e: any) => {onClickBtn(e)}} className={chatWho(value)} value={value.C_token}>{value.C_dm ? (value.C_user_1 == Props.state.user.username ? value.C_user_2 : value.C_user_1) : value.name}</button>
			)}
		</div>
		<div className={styles.chat} ref={chat}>
			{Props.state.msg.map((value: any, index: Key) => 
				<div key={index} className={msgWho(value)}>{value.U_username != Props.state.user.username ? <Link to= "/home/other_profil" state= {{ username : value.U_username }}>{value.U_username}</Link>: value.U_username}{value.id == -1 ? "" : " : "}{value.content}</div>)}
		</div>
		{logged &&
		<div className={styles.chatTextBox}>
			<input className={styles.chatInputText} type="text" ref={inputText} onKeyDown={(e) => {if (e.key == 'Enter') sendText()}}/>
			<button tabIndex={1} className={styles.chatBtnSend} onClick={sendText}>send</button>
		</div>
		}
		<div>
			{!logged && inputPassword &&
			<div>
				<label className={styles.passwordPlacement}> Password : </label>
				<input className={styles.inputPasswordChat} type="text" ref={inputPasswordChat} onKeyDown={(e) => {if (e.key == 'Enter') sendPassword()}}/>
				<button className={styles.createChannelPassword_btn} onClick={sendPassword}>send</button>
			</div>}
			<label className={styles.errorPlacement} ref={errormsg}></label>
		</div>
	</div>
	);
};

export default ChatWindows;