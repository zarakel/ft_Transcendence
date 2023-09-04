import { useEffect, useState } from "react";
import Navbar from "../components/Navbar"
import Game from "../components/Game"
import JoinGame from "../components/JoinGame";
import Searching from "../components/Searching";
import s_game from "../styles/game.module.scss";
import s_home from "../styles/home.module.scss"
import useUser from "../hooks/useUser";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../components/AppContext";
import ChatPopUp from "../components/ChatPopUp";
import GamePopUp from "../components/GamePopUp";


const Home = () => {
	const { socket } = useAppContext();
	const user = useUser();
	const [searching, setSearching] = useState(false);
	const [match, setMatch] = useState(false);
	const [end, setEnd] = useState(false);
	const [msgEnd, setMsgEnd] = useState("");
	const navigate = useNavigate();
	let { id } = useParams();
	const [chatPopUp, setChatPopUp] = useState(false);
	const [channelToken, setChannelToken] = useState("");
	const [gamePopUp, setGamePopUp] = useState(false);
	const [gameToken, setGameToken] = useState("");

	useEffect(() => {
		if (id && !match){
			if (socket.ready){
				//setSearching(true);
				socket.emit("message", {sender :
					{id: user.id ,username: user.username
				}, Roomtoken: id, RoomType: "game", type: "join"});

				socket.on("game.join", (data: any) => {
					setSearching(false);
					setMatch(true);
				});
			}
		}
		return () => {};
	}, [id, socket.ready]);

	useEffect(() => {

		socket.on("lobby.match", (data: any) => {
			navigate(`/home/${data.token}`);
		});

		socket.on("chat.redirectChat", (data: any) => {
			setChatPopUp(true);
			setChannelToken(data.Roomtoken);
		});
	
		socket.on("invit.gameCreate", (data: any) => {
			if (!searching || !match) {
				setGamePopUp(true);
				setGameToken(data.token);
			}
		});
	}, [socket.ready])

	return (						
	
		<div className={s_home.home}>
			<Navbar ProfilSignal={false} HomeSignal={true}/>
			<div className={s_game.game_screen}>
				{!searching && !match && <JoinGame state={{user: user, setSearching: setSearching}}/>}
				{searching && !match && <Searching state={{user: user, setSearching: setSearching, setMatch: setMatch, match: match, id: id}}/>}
				{!searching && match && <Game state={{setSearching: setSearching, setMatch: setMatch, match: match, id: id, setMsgEnd: setMsgEnd, msgEnd: msgEnd, setEnd: setEnd, end: end}}/>}
				{end && <h1>{msgEnd}</h1>}
			</div>

			{chatPopUp && <ChatPopUp state={{setChatPopUp: setChatPopUp, channelToken: channelToken}}/>}
			{gamePopUp && !searching && !match &&  <GamePopUp state={{setGamePopUp: setGamePopUp, gameToken: gameToken, socket : socket, user : user}}/>}

		</div>
	);
  };

  export default Home;