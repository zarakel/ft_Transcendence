import { Link } from "react-router-dom";
import ChatWindows from "../components/ChatWindow";
import Navbar from "../components/Navbar"
import useUser from "../hooks/useUser";
import { useEffect, useState } from "react";
import CreateChannel from "../components/CreateChannel";
import styles from "../styles/chat.module.scss";
import { useAppContext } from "../components/AppContext";
import ChatPopUp from "../components/ChatPopUp";
import GamePopUp from "../components/GamePopUp";
import { useLocation } from "react-router-dom";
import ChatUsers from "../components/ChatUsers";


const Chat = () => {

	let url = "";
	const [choseToken, setChoseToken] = useState("");
	const location = useLocation();
	const {socket} = useAppContext();
	const user = useUser();
	const [chats, setChats]: any = useState([]);
	const [users, setUsers] = useState([]);
	const [usersChat, setUsersChat]: any = useState([]);
	const [mainChat, setMainChat] = useState("");
	const [msg, setMsg]: any = useState([]);
	const [chatPopUp, setChatPopUp] = useState(false);
	const [channelToken, setChannelToken] = useState("");
	const [gamePopUp, setGamePopUp] = useState(false);
	const [gameToken, setGameToken] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	const [bouboule, setBouboule] = useState(false);
	const [newUser, setNewUser] = useState(false);

	const getMsg = async (token: string) => {
		let rep = await fetch("http://" + document.location.hostname + ":3000/chat/chat_messages",
		{
			method: "POST",
            headers:
			{
                "Content-Type": "application/json",
        		'cors': 'true',
				"Authorization": "Bearer " + localStorage.getItem("jwt_token")
            },
			body: JSON.stringify({chat_id: token})
		});
		let use = await rep.json();
		setMsg(use.m);
		setUsersChat(use.u);
	};

	const getChannel = async () => {
		let rep = await fetch("http://" + document.location.hostname + ":3000/chat/user_chats",
		{
			method: "GET",
            headers: 
			{
                "Content-Type": "application/json",
        		'cors': 'true',
				"Authorization": "Bearer " + localStorage.getItem("jwt_token")
            }
		});
		let use = await rep.json();
		setChats(use);
	}

	useEffect(() => {
		if (socket.ready) {
			setBouboule(true);
			if (location && location.state)
			{
				setChoseToken(location.state["channelToken"]);
				setBouboule(false);
				window.history.replaceState(null, '');
			}
		}
	}, [socket.ready, msg, chats])
	
	useEffect(() => {
		socket.on("ChatRoomCreated", (data: any) => {

			let passworded = true;
			if (data.error) {
				setErrorMsg(data.msg)
				return ;
			}
			if (data.password == "" || data.password == null || data.password == undefined)
				passworded = false;
			setChats([...chats, {C_id: data.RoomId, C_token: data.Roomtoken, 
				is_logged: false, passworded: passworded, C_dm: data.dm.bool, 
				C_user_1: data.dm.user1, C_user_2: data.dm.user2, name: data.name, C_is_private: data.privacy == "private" ? true : false }]);
			if (data.dm.bool)
				setChoseToken(data.Roomtoken);
		});
		return () => {};
	}, [socket.ready, chats])

	useEffect(() => {
		socket.on("chat.msg", (data: any) => {
			if (mainChat == data.Roomtoken)
				setMsg([...msg, {U_username: data.sender.username, id: 0, content: data.msg}]);
		});
		socket.on("chat.changePasswordResult", (data: any) => {
			setMsg([...msg, {U_username:"", id: -1, content: data.msg}]);
		});
		socket.on("chat.muteResult", (data: any) => {
			setMsg([...msg, {U_username: "", id: -1, content: data.msg}]);
		});
		socket.on("chat.kickResult", (data: any) => {
			if (data.status == "error" || user.id == data.sender.id) {
				setMsg([...msg, {U_username: "", id: -1, content: data.msg}]);
			}
			else {
				setChannelToken("");
				setMainChat("");
				setMsg([]);
				getChannel();
			}
		});
		socket.on("chat.leaveResult", (data: any) => {
			if (data.status != "error" && user.id == data.sender.id) {
				setChannelToken("");
				setMainChat("");
				setMsg([]);
				getChannel();
			}
			else {
				setMsg([...msg, {U_username: "", id: -1, content: data.msg}]);
			}
		});
		socket.on("chat.addResult", (data: any) => {
			setMsg([...msg, {U_username: "", id: -1, content: data.msg}]);
			if (mainChat == data.Roomtoken)
				setNewUser(true);
		});
		socket.on("chat.banResult", (data: any) => {
			setChannelToken("");
			setMainChat("");
			setMsg([...msg, {U_username: "", id: -1, content: data.msg}]);
			getChannel();
		});
		socket.on("chat.setadminResult", (data: any) => {
			setMsg([...msg, {U_username: "", id: -1, content: data.msg}]);
		});
		socket.on("chat.redirectChat", (data: any) => {
			setChatPopUp(true);
			setChannelToken(data.Roomtoken);
		});
		socket.on("invit.gameCreate", (data: any) => {
			setGamePopUp(true);
			setGameToken(data.token);
		});
		return () => {};
	}, [socket.ready, msg, mainChat])

	useEffect(() => {
		getChannel();
	}, [url]);
	
	return (
    <div className="overflow-x-hidden flex flex-col w-screen h-screen bg-black relative">
       <Navbar ProfilSignal={false} HomeSignal={false} />

      {/* arborescence du site */}

      <div className="flex flex-row justify-center">
        <div className="mx-7 text-white text-sm">
          <Link to="/Home"> Home </Link>
        </div>
      </div>

      { /* vilaine chiasse */}

		<div className={styles.allchat}>
			<ChatWindows state={{user: user, chats: chats, setChats: setChats, setMainChat: setMainChat,
				mainChat: mainChat, msg: msg, setMsg: setMsg, getChannel: getChannel, choseToken: choseToken, 
				setChoseToken: setChannelToken, setUsersChat: setUsersChat, usersChat: usersChat, newUser: newUser, getMsg: getMsg, bouboule: bouboule}}/>
			<div className={styles.menu}>	
				{errorMsg && <div className="text-red-600"> {errorMsg} </div>}
				<CreateChannel state={{user: user, users: users, setUsers: setUsers, setErrorMsg: setErrorMsg}}/>
				<ChatUsers state={{usersChat: usersChat}}/>
			</div>
		</div>

      { /* fin vilaine chiasse */}

		{chatPopUp && <ChatPopUp state={{setChatPopUp: setChatPopUp, channelToken: channelToken, setChannelToken: setChannelToken, bouboule: bouboule, setBouboule: setBouboule}}/>}
		{gamePopUp && <GamePopUp state={{setGamePopUp: setGamePopUp, gameToken: gameToken, socket : socket, user : user}}/>}

    </div>
	);
};

  export default Chat;