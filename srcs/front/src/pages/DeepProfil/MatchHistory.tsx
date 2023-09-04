import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar"
import { useEffect, useState } from "react";
import useUser from "../../hooks/useUser";
import ChatPopUp from "../../components/ChatPopUp";
import GamePopUp from "../../components/GamePopUp";
import { useAppContext } from "../../components/AppContext";

interface gameHistory extends Array<Game>{};

interface Game{
	user_left: string;
	user_right: string;
	left_score: number;
	right_score: number;
	status: string;
}

const MatchHistory = () => {

	const { socket } = useAppContext();
	const [Games, setGames] = useState<gameHistory>([]);
	const [check, setCheck] = useState<boolean>(false);
	const user = useUser();
	const [chatPopUp, setChatPopUp] = useState(false);
	const [channelToken, setChannelToken] = useState("");
	const [gameToken, setGameToken] = useState("");
	const [gamePopUp, setGamePopUp] = useState(false);	

	const checkGame = async (setGames: any, setCheckGames: any) => {
        const url = `http://${document.location.hostname}:3000/game/gameresults/${user.id}`;
        const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "cors": "true",
            "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        }
        });
        let data: gameHistory = await response.json();
        if (data && data.length > 0)
        {
            setGames(data);
			setCheck(true);
        }
	}
	
	useEffect(() => {
		checkGame(setGames, setCheck);
		}, []);

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

	return (
	<div className="flex flex-col w-screen h-screen bg-black">

    	<Navbar ProfilSignal={true} HomeSignal={false}/>


		{/* arborescence du site */}

		<div className="flex flex-row justify-center">
			<div className="flex flex-row mx-7 text-white text-sm">
				<Link to="/home"> Home </Link>
				<h1> &nbsp; { ' > ' } &nbsp; </h1>
				<Link to="/home/profil"> Profil </Link>
			</div>
		</div>


		<div className="flex flex-col mt-10 p-4 mx-auto h-2/3 w-4/6 rounded-lg overflow-auto mb-10 space-y-4">
			<div className="px-4 py-8 flex-row-reverse flex justify-left ">
				<div className="space-y-3 mt-5 w-full text-center ">
					<div>
					{check === false && 
						<h1 className="text-white text-2xl font-semibold my-auto"> No games played yet </h1>
					}
					</div>
					{check === true &&  Games.map((game, index) => (
						<div key={index} className="">
						{((game.user_left !== user.username && game.left_score < game.right_score) ||
						(game.user_left === user.username && game.left_score > game.right_score)) &&
						<div className="w-full rounded bg-blue-300 my-auto">
							<span className="font-semibold"> Game &nbsp;{index + 1} </span>
							<h1 className="" > {game.user_left} : {game.left_score} vs&nbsp;
							{game.user_right} : {game.right_score} </h1>
							<h1 className="font-semibold"> WIN </h1>
						</div>
						}
						{((game.user_left !== user.username && game.left_score > game.right_score) ||
						(game.user_left === user.username && game.left_score < game.right_score)) &&
						<div className="w-full rounded bg-red-300">
							<span className="font-semibold"> Game &nbsp;{index + 1} </span>
							<h1 className="" > {game.user_left} : {game.left_score} vs&nbsp;
							{game.user_right} : {game.right_score} </h1>
							<h1 className="font-semibold"> LOSE </h1>
						</div>
						}
					</div>
					))}
				</div> 
			</div>
		</div>

		{chatPopUp && <ChatPopUp state={{setChatPopUp: setChatPopUp, channelToken: channelToken}}/>}
		{gamePopUp && <GamePopUp state={{setGamePopUp: setGamePopUp, gameToken: gameToken, socket : socket, user : user}}/>}


    </div>
	);
  };

  export default MatchHistory;