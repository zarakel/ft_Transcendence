import styles from "../styles/game.module.scss";
import logo from "../balle blanche.svg";
import { useAppContext } from "./AppContext";

const JoinGame = (Props: any) => {

	const {socket} = useAppContext();
	
	const join = () =>{
		socket.emit("message", {sender :
							{id: Props.state.user.id ,username: Props.state.user.username
							}, Roomtoken: "0", RoomType: "lobby", type: "join"});
		Props.state.setSearching(true);
	}

	return (
		<div className={styles.game_menu}>
			<img className={styles.game_img} src={logo} alt="" />
				<button className="flex mx-auto my-3 btn-primary" onClick={join}> Partie Rapide </button>
		</div>
	);
};

export default JoinGame;
