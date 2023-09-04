import { useState, useRef } from "react"
import styles from "../styles/chat.module.scss";
import { useAppContext } from "./AppContext";

const CreateChannel = (Props: any) => {
	const [connected, setConnected] = useState(false);
	const [isPrivate, setIsPrivate] = useState(false);
	const [inputUsers, setInputUsers]: any = useState([]);
	const {socket} = useAppContext();
	const inputPassword: any = useRef(null);
	const inputName: any = useRef(null);
	
	const chatStart = async () => {
		Props.state.setErrorMsg("");
		let rep = await fetch("http://" + document.location.hostname + ":3000/user/get_players",
		{
			method: "POST",
            headers: 
			{
                "Content-Type": "application/json",
        		'cors': 'true',
				"Authorization": "Bearer " + localStorage.getItem("jwt_token")
            }
		});
		let use = await rep.json();
		Props.state.setUsers(use.filter((item: any) => item.id != Props.state.user.id));
		setConnected(true);
	}

	const handleChange = (e: any) => {
		if (e.target.checked)
			setInputUsers([...inputUsers, e.target.value]);
		else
			setInputUsers(inputUsers.filter((item: any) => item !== e.target.value))
	};

	const create = () => {
		let name = inputName.current;
		let privacy = isPrivate ? "private" : "public";
		let password = null;
		if (privacy == "public")
		{
			setInputUsers(Props.state.user.id);
			Props.state.users.forEach((newUser: any) => {
				if (newUser.id != Props.state.user.id)
					setInputUsers([...inputUsers, newUser.id])
			});

		}
		if (inputPassword.current) {
			if (inputPassword.current.value != "")
				password = inputPassword.current.value;
			inputPassword.current.value = "";
		}
		if (socket.ready)
			socket.emit("message", {sender :
				{id: Props.state.user.id ,username: Props.state.user.username
			}, Roomtoken: "none", RoomType: "chat", type: "create", users: inputUsers, name: name.value,
			password: password, privacy: privacy, dm:{ bool: false }});
		setInputUsers([]);
		setConnected(false);
	};

	const cancel = () => {
		setConnected(false);
	}

	return (
	<div className={styles.createChannelwindows}>
		{!connected && <button className={styles.createChannelwindows_btn} onClick={chatStart}>create a channel</button>}
		{connected && <h2 className="text-sm">Chat name :</h2>}
		{connected && <input className={styles.inputPassword} type="text" ref={inputName}/>}
		{connected &&
			<div>
				<div>
					<input value="public" name="privacy" type="radio" checked={!isPrivate} onChange={() => setIsPrivate(!isPrivate)}/>
					<label>public</label>
				</div>
				<div>
					<input value="private" name="privacy" type="radio" checked={isPrivate} onChange={() => setIsPrivate(!isPrivate)}/>
					<label>private</label>
				</div>
			</div>
		}
		{connected && isPrivate &&			
			<div className={styles.selectUser}>
				{Props.state.users.map((value: any, index: any) => 
				<div key={index}>
					<input value={value.id} type="checkbox" onChange={handleChange}/>
					<label className="text-white">{value.username}</label>
				</div>)}
			</div>
		}
		{connected && isPrivate &&<h2 className="text-sm">password:</h2>}
		{connected && isPrivate && <input className={styles.inputPassword} type="text" ref={inputPassword} onKeyDown={(e) => {if (e.key == 'Enter') create()}}/>}
		{connected &&
			<div className="flex flex-row">
				<button className={styles.createChannelwindows_btn} onClick={create}>create</button>
				<button className={styles.createChannelwindows_btn} onClick={cancel}>cancel</button>
			</div>
		}
	</div>);
};

export default CreateChannel;