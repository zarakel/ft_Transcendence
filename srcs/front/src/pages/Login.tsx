import { useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom'
import logo from "../pod blanc.svg"

const Login = () => { 

	const [searchParams] = useSearchParams();
	const [token, setToken] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [tfa, setTFA] = useState(localStorage.getItem("tfa_token") == null);
	const [click, setClick] = useState(false);
	const [code, setCode] = useState("");
	let codeuri = searchParams.get("code");


	useEffect(() => {
		setTimeout(() => {
			if (localStorage.getItem("jwt_token"))
				document.location.href = "http://" + document.location.hostname + "/home"
		}, 500);
	}, [token]);

	useEffect(() => {
		if (codeuri && !localStorage.getItem("jwt_token"))
		{
			setClick(true);
			getToken();
		}
	}, []);

	const useAuth = async (e : any) => {
		setClick(true);
		e.preventDefault();
		const hostname = document.location.hostname;

		let request = await fetch("http://" + hostname + ":3000/login/code", 
		{
			method: "POST",
            headers: 
			{
                "Content-Type": "application/json",
        		'cors': 'true'
            },
			body: JSON.stringify({redirect_uri: "http://" + hostname})
		});

		let response = await request.json();
		document.location.href = response.url;
	}

	const getToken = async () => 
	{
		let request = await fetch("http://" + document.location.hostname + ":3000/login/token/" + codeuri, 
		{
			method: "POST",
            headers: 
			{
                "Content-Type": "application/json",
        		'cors': 'true'
            }
		});
		let res = await request.json();
		if (res.error)
		{
			setErrorMessage("Error :" + res.message)
			setClick(false);
		}
		else
		{
			Object.entries(res).forEach(([key, value]) => {
				localStorage.setItem(key, value as string);
			  });
			if (res.tfa_token)
			  setTFA(false);
			setToken(true);
		}
	}

	const sendCode = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		let request = await fetch("http://" + document.location.hostname + ":3000/login/2fa/validate",
		{
			method: "POST",
			headers:
			{
				"Content-Type":  "application/json",
				'cors': 'true',
				'Authorization': `Bearer ${localStorage.getItem("tfa_token")}`
			},
			body: JSON.stringify({code: code})
		})
		let res = await request.json();
		if (res.invalid_code)
		{
			setErrorMessage("Code invalide")
			return ;
		}
		Object.entries(res).forEach(([key, value]) => {
			localStorage.setItem(key, value as string);
		});
		localStorage.removeItem("tfa_token");
		document.location.href = "http://" + document.location.hostname + "/home";
	}

	return  (
		 
			!tfa ?
			
			<div className="flex flex-col overflow-auto w-screen h-screen items-center text-center bg-black ">
				{errorMessage && <div className="text-white flex justify-center"> {errorMessage} </div>}
				<div className="flex justify-around transition m-auto p-2 rounded ease-in-out hover:bg-sky-700">
					<form onSubmit={sendCode} className="rounded bg-white">
						<input type="text" placeholder="Entrer le code 2FA" className="p-2 z-o rounded outline-none" value={code} onChange={(e) => setCode(e.target.value)}/>
						<button type="submit" className="p-2 z-1 bg-gray-300 rounded">
							Envoyer
						</button>
					</form>
				</div>
			</div>
		:
		<div className= "overflow-auto w-screen h-screen flex flex-col bg-black items-center text-center ">
			<header className= "space-y-32 mt-80">
				<img src={logo} className= "scale-125 transition ease-in-out delay-150 fill-black hover:scale-150 duration-300" />
				{errorMessage && <div className="text-white"> {errorMessage} </div>}
				{!click && !codeuri && <button className ="btn-primary" onClick={useAuth}> Log-in </button>}
				{click && <h1 className="text-white text-2xl">LOADING...</h1>}
			</header>
		</div>
	);

  };

  export default Login;