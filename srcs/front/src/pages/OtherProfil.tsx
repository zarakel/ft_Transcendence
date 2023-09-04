import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"
import { useEffect, useRef, useState } from "react";
import saucisseMalada from "../saucisseMalada.jpg"
import { useAppContext } from "../components/AppContext";
import useUser from "../hooks/useUser";
import ChatPopUp from "../components/ChatPopUp";
import GamePopUp from "../components/GamePopUp";

interface gameHistory extends Array<Game>{};

interface Game{
	user_left: string;
	user_right: string;
	left_score: number;
	right_score: number;
	status: string;
}

const OtherProfil = (Props: any) => {

    const [Games, setGames] = useState<gameHistory>([]);
	const [check, setCheck] = useState<boolean>(false);
	const [chatPopUp, setChatPopUp] = useState(false);
	const [gamePopUp, setGamePopUp] = useState(false);
	const location = useLocation();
    const hostname = document.location.hostname;
	const { username } = location.state;
    const [link, setLink]: any = useState({});
	const [otherUser, setotherUser]: any = useState({});
	const user = useUser();
	const url = "";
	const imgref = useRef<any>();
	const { socket } = useAppContext();
	const navigate = useNavigate();
	const [channelToken, setChannelToken] = useState("");
	const [gameToken, setGameToken] = useState("");


	const getUser = async () => {
		const url = `http://${document.location.hostname}:3000/user/get_profil/${username}`;
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"cors": "true",
				"Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
			}
		});
		let rep = await response.json();
		setotherUser(rep);
		castImage(rep.profile_pic);
	} 

    const checkGame = async () => {
        const url = `http://${document.location.hostname}:3000/game/gameresults/${otherUser.id}`;
        const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "cors": "true",
            "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        }
        });
        let data: gameHistory = await response.json();
        if (data && data.length > 0) {
            setGames(data);
			setCheck(true);
        }
	}
	
	const castImage = async (profile_pic: string) => {
		const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
		await sleep(200);
		let pic: string;
		try {
			let check: string | null = profile_pic;
			if (check !== null) {
                var tmp_check = new String ( check );
                if (tmp_check.indexOf("data:image/") >= 0) {
                    pic = check;
                }
                else
                    pic = "data:image/png;base64," + check;
				if (imgref.current)
					imgref.current.src = pic;
				return (pic);
			}
		}
		catch (error) {
			console.error("the content of profile_pic isn't right: ", error);
		}
	}   

    const addFriend = async () => {
        let request = await fetch("http://" + hostname + ":3000/friend/add/" + otherUser.username, 
		{
			method: "POST",
            headers: 
			{
                "Content-Type": "application/json",
        		'cors': 'true',
                "Authorization": "Bearer " + localStorage.getItem("jwt_token")
            }
		});
        let res = await request.json();
		if (!res.error)
        	getLink();
    }

    const blockUser = async () => {
        let request = await fetch("http://" + hostname + ":3000/friend/block/" + otherUser.username, 
		{
			method: "POST",
            headers: 
			{
                "Content-Type": "application/json",
        		'cors': 'true',
                "Authorization": "Bearer " + localStorage.getItem("jwt_token")
            }
		});
        let res = await request.json();
		if (!res.error)
        	getLink();
    }

	const inviteDM = async () => {
		socket.emit("message", {sender:
			{id: user.id ,username: user.username
		}, Roomtoken: "none", RoomType: "chat", name:"dm-", type: "create", users: [],
		password: null, privacy: "private", dm: {user1: user.username, user2: otherUser.username, bool: true}});
		socket.emit("redirectChat", {sender:
			{id: user.id ,username: user.username}, otherUserId: otherUser.id, otherUserUsername: otherUser.username});
		navigate("/home/chat");
	}

	const inviteGame = async () => {
		socket.emit("createGame", {sender: {id: user.id ,username: user.username}, challenger: otherUser.id});
		socket.once("invit.gameCreate", (data: any) => 
		{
			if (data.sender.id == user.id)
			{
				setGameToken(data.token);
				navigate(`/home/${data.token}`);
			}
		})
	}

    const getLink = async () => {
        let request = await fetch("http://" + hostname + ":3000/friend/info/" + otherUser.username, 
		{
			method: "POST",
            headers: 
			{
                "Content-Type": "application/json",
        		'cors': 'true',
                "Authorization": "Bearer " + localStorage.getItem("jwt_token")
            }
		});
        let res = await request.json();
        setLink(res);
    }

	useEffect(() => {
		getUser();
	}, [url]);

	useEffect(() => {
		if (!check){
			if (otherUser.id !== undefined)
				checkGame();
			if (otherUser.username !== undefined)
				getLink();
		}
	}, [otherUser, check])

	useEffect(() => {
		socket.on("chat.redirectChat", (data: any) => {
			setChatPopUp(true);
			setChannelToken(data.Roomtoken);
		})

		socket.on("invit.gameCreate", (data: any) => {
			setGamePopUp(true);
			setGameToken(data.token);
		})
	}, [socket.ready]);
	
	return (
    <div className="overflow-x-hidden flex flex-col w-screen h-screen bg-black overflow-y-auto">
       <Navbar ProfilSignal={false} HomeSignal={false} />

      {/* arborescence du site */}

    	<div className="flex flex-row justify-center">
			<div className="flex flex-row mx-7 text-white text-sm">
				<Link to="/home"> Home </Link>
				<h1> &nbsp; { ' > ' } &nbsp; </h1>
				<Link to="/home/chat"> Chat </Link>
			</div>
		</div>

      { /* vilaine chiasse */}

		{/* <div className="w-full my-5 flex justify-around flex-col space-y-10"> */}
			<div className="flex flex-col-3 my-5 text-center justify-around space-x-12 text-white">
				<div className="flex flex-col test-xl space-y-10 group-hover:block hover:rounded hover:border hover:border-white transition ease-in-out p-4 hover:bg-sky-700">
					<div className="flex flex-row m-auto space-x-8 justify-center">
						<img ref={imgref} src={saucisseMalada} className="flex float-left w-20 h-20 rounded-full object-cover" alt="la saucisse malade"/>
						<h1 className="flex text-3xl font-bold italic">
							{otherUser.username}
						</h1>
					</div>
					<h1>
						Win {otherUser.win} | Lose {otherUser.lose}
					</h1> 
					<h1>
						Level {otherUser.level}
					</h1> 
					<h1>
						MMR {otherUser.mmr}
					</h1>
					<div className="flex flex-row ">
						<button onClick={addFriend} className="my-auto font-bold transition ease-in-out p-2 hover:text-sky-500 hover:scale-110">
							{link.friend ? "Remove friend" : "Add friend"}
						</button>
						<button onClick={blockUser} className="my-auto font-bold transition ease-in-out p-2 hover:text-sky-500 hover:scale-110">
							{link.blocked ? "Unblock user" : "Block user"}
						</button>
						<button onClick={inviteDM} className="my-auto font-bold transition ease-in-out p-2 hover:text-sky-500 hover:scale-110">
							Direct Message
						</button>
						<button onClick={inviteGame} className="my-auto font-bold transition ease-in-out p-2 hover:text-sky-500 hover:scale-110">
							Invite Game
						</button>
					</div>		
				</div>
			</div>

			<div className="flex text-center overflow-auto ">
				{check === false && 
					<h1 className="text-white text-2xl font-semibold mt-24 mx-auto"> No games played yet </h1>
				}
				{check === true &&
					<div className=" mx-auto max-h-[90%] flex flex-col w-4/6 rounded space-y-4 overflow-x-hidden">
					{Games.map((game, index) => (
				<div key={index} className="">
					{((game.user_left !== otherUser.username && game.left_score < game.right_score) ||
					(game.user_left === otherUser.username && game.left_score > game.right_score)) &&
					<div className="w-full rounded bg-blue-300 my-auto">
						<span className="font-semibold"> Game &nbsp;{index + 1} </span>
						<h1 className="" > {game.user_left} : {game.left_score} vs&nbsp;
						{game.user_right} : {game.right_score} </h1>
						<h1 className="font-semibold"> WIN </h1>
					</div>
					}
					{((game.user_left !== otherUser.username && game.left_score > game.right_score) ||
					(game.user_left === otherUser.username && game.left_score < game.right_score)) &&
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
				}
			</div> 

      { /* fin vilaine chiasse */}

		{chatPopUp && <ChatPopUp state={{setChatPopUp: setChatPopUp, channelToken: channelToken}}/>}
		{gamePopUp && <GamePopUp state={{setGamePopUp: setGamePopUp, gameToken: gameToken, socket : socket, user : user}}/>}

    </div>
	);
};

export default OtherProfil;