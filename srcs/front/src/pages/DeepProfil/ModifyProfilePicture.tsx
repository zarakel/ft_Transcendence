import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar"
import ModifyPictureComp from "../../components/ModifyProfilPictureComponents"
import { useAppContext } from '../../components/AppContext';
import ChatPopUp from '../../components/ChatPopUp';
import GamePopUp from '../../components/GamePopUp';
import useUser from '../../hooks/useUser';

const ModifyPicture = () => {

	const { socket } = useAppContext();
	const [chatPopUp, setChatPopUp] = useState(false);
	const [channelToken, setChannelToken] = useState("");
	const [gameToken, setGameToken] = useState("");
	const [gamePopUp, setGamePopUp] = useState(false);
	const user = useUser();

	useEffect(() => {
		socket.on("chat.redirectChat", (data: any) => {
			setChatPopUp(true);
			let tmp: string = data.Roomtoken;
			setChannelToken(tmp);
		})
	
		socket.on("invit.gameCreate", (data: any) => {
			setGamePopUp(true);
			let tmp: string = data.token;
			setGameToken(tmp);
		})
	}, [socket.ready])
	
	return (
		<div className="absolute flex flex-col overflow-auto w-full h-full bg-black ">

			<Navbar ProfilSignal={true} HomeSignal={false}/>

			{/* arborescence du site */}

			<div className="flex flex-row justify-center">
				<div className="flex flex-row mx-7 text-white text-sm">
					<Link to="/Home"> Home </Link>
					<h1> &nbsp; { ' > ' } &nbsp; </h1>
					<Link to="/Home/Profil"> Profil </Link>
				</div>
			</div>
			<ModifyPictureComp/>
			{chatPopUp && <ChatPopUp state={{setChatPopUp: setChatPopUp, channelToken: channelToken}}/>}
			{gamePopUp && <GamePopUp state={{setGamePopUp: setGamePopUp, gameToken: gameToken, socket : socket, user : user}}/>}
		</div>
  );
};

export default ModifyPicture;
