import { Key, useEffect } from "react";
import styles from "../styles/chat.module.scss";
import manette from "../manette.svg"
import pastilleVerte from "../pastilleVerte.svg"
import deco from "../deco.svg"
import { Link } from "react-router-dom";

const ChatUsers = (Props: any) => {
	const setImage = (ingame: boolean, online: boolean): string => {
		if (ingame)
			return manette;
		if (online)
			return pastilleVerte;
		return deco;
	};

	return(
	<div className={styles.chatUsers}>
		{
			Props.state.usersChat.map((value: any, index: Key) =>
				<div className={styles.userChat} key={index}>
					<Link className="text-sm" to= "/home/other_profil" state= {{ username : value.username }}>{value.username}</Link>
					<img className="w-6 h-6" src={setImage(value.ingame, value.online)} alt="aie aie aie"/>
				</div>
			)
		}
	</div>
	);
};

export default ChatUsers;