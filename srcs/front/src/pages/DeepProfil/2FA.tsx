import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar"
import QRCode from "react-qr-code";
import ChatPopUp from '../../components/ChatPopUp';
import GamePopUp from '../../components/GamePopUp';
import { useAppContext } from '../../components/AppContext';
import useUser from '../../hooks/useUser';


const TFA = () => {

	const [chatPopUp, setChatPopUp] = useState(false);
	const { socket } = useAppContext(); 
	const [qr_code, setQRCode] = useState("");
	const [code, setCode] = useState("");
	const [tfa, setTFA] = useState(localStorage.getItem("tfa_enable") == "true");
	const [channelToken, setChannelToken] = useState("");
	const [gameToken, setGameToken] = useState("");
	const [gamePopUp, setGamePopUp] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const user = useUser();


	const enableTFA = async () => {

		let request = await fetch("http://" + document.location.hostname + ":3000/login/2fa/enable",
		{
			method: "POST",
			headers:
			{
				"Content-Type":  "application/json",
				'cors': 'true',
				'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
			}
		})
		let res = await request.json();
		if (res.qr_code != undefined)
			setQRCode(res.qr_code)
	}

	const disableTFA = async () => {

		let request = await fetch("http://" + document.location.hostname + ":3000/login/2fa/disable",
		{
			method: "POST",
			headers:
			{
				"Content-Type":  "application/json",
				'cors': 'true',
				'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
			}
		})
		let res = await request.json();
		if (res.error)
		{
			setErrorMessage("Error disabling TFA")
			return ;
		}
		localStorage.setItem("tfa_enable", res.tfa_enable);
		setTFA(false);
	}

	useEffect(() => {
		enableTFA();
	}, []);

	const sendCode = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		let request = await fetch("http://" + document.location.hostname + ":3000/login/2fa/validate",
		{
			method: "POST",
			headers:
			{
				"Content-Type":  "application/json",
				'cors': 'true',
				'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
			},
			body: JSON.stringify({code: code})
		})
		let res = await request.json();
		if (res.invalid_code)
		{
			setErrorMessage("Code invalide")
			return ;
		}
		setErrorMessage("");
		localStorage.setItem("tfa_enable", res.tfa_enable);
		setTFA(true);
	}

	useEffect(() => {
		socket.on("chat.redirectChat", (data: any) => {
			setChatPopUp(true);
		});
	
		socket.on("invit.gameCreate", (data: any) => {
			setGamePopUp(true);
			let tmp: string = data.token;
			setGameToken(tmp);
		})
	}, [socket.ready]);



  	return (
		<div className="flex flex-col w-screen h-screen bg-black">

			<Navbar ProfilSignal={true} HomeSignal={false}/>


			{/* arborescence du site */}

			<div className="flex flex-row justify-center">
				<div className="flex flex-row mx-7 text-white text-sm">
					<Link to="/Home"> Home </Link>
					<h1> &nbsp; { ' > ' } &nbsp; </h1>
					<Link to="/Home/Profil"> Profil </Link>
				</div>
			</div>

			{/** QR code et textbox */}

			{tfa ?
			<div className="flex flex-col m-auto space-y-4">
				<div className="text-green-400 flex justify-center">TFA activé !</div>
				<button onClick={disableTFA} className="p-2 z-1 bg-red-300 rounded hover:scale-110 transition ease-in-out duration-300">Désactivé TFA</button>
			</div>
			:
			<div className="flex flex-col">
				<div className="flex justify-center my-20">	
					<div className="flex bg-sky-700 p-5">
						<QRCode value={qr_code}/>
					</div>
				</div>
				{errorMessage && <div className="text-white flex justify-center red-text">{errorMessage}</div>}
				<div className="flex justify-center">
					<form onSubmit={sendCode} className="rounded bg-white">
						<input type="text" placeholder="Entrer le code 2FA" className="p-2 z-o rounded outline-none" value={code} onChange={(e) => setCode(e.target.value)}/>
						<button type="submit" className="p-2 z-1 bg-gray-300 rounded">
							Envoyer
						</button>
					</form>
				</div>
			</div>}

			{chatPopUp && <ChatPopUp state={{setChatPopUp: setChatPopUp, channelToken: channelToken}}/>}
			{gamePopUp && <GamePopUp state={{setGamePopUp: setGamePopUp, gameToken: gameToken, socket : socket, user : user}}/>}
			
		</div>
	);
	};

export default TFA;
