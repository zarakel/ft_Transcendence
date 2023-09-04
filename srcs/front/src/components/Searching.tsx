import styles from "../styles/game.module.scss";
import logo from "../balle blanche.svg";
import { useAppContext } from "./AppContext";
import { useEffect } from "react";

const Searching = (Props: any) => {

	const {socket} = useAppContext();

	useEffect(() => {
		socket.on("game.join", (data: any) => {
			Props.state.setSearching(false);
			Props.state.setMatch(true);
		});
	}, [socket.ready])
	
	const cancel = () => {
		socket.emit("message", {sender :
			{id: Props.state.user.id ,username: Props.state.user.username
			}, Roomtoken: "0", RoomType: "lobby", type: "leave"});
		Props.state.setSearching(false);
		Props.state.setMatch(false);
	}

	return (
	<div className={styles.game_loading}>
		<img className={styles.game_img} src={logo} alt="" />
		<h1 className={styles.game_msg}> SEARCHING...</h1>
		<button className="flex mx-auto my-3 btn-primary" onClick={cancel}>Cancel</button>
	</div>);
};

export default Searching;