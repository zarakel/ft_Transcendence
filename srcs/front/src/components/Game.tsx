import { useEffect, useState} from 'react';
import styles from "../styles/game.module.scss";
import useCanvas from "../hooks/useCanvas";
import { useAppContext } from './AppContext';
import useUser from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';

export const PONG_W: number = 600;
export const PONG_H: number = 400;
export const PLAYER_W: number = 10;
export const PLAYER_RATIO = 3;
export const PLAYER_H: number = PONG_H / PLAYER_RATIO;

const Game = (Props: any) => {
	const [start, setStart] = useState(false);
	const [count, setCount] = useState(3);
	const [size, setSize] = useState({w: PONG_W, h: PONG_H});
	const [player1, setPlayer1] = useState({y: PONG_H / 2 - PLAYER_H / 2, score: 0, color: ""});
	const [player2, setPlayer2] = useState({y: PONG_H / 2 - PLAYER_H / 2, score: 0, color: ""});
	const [ball, setBall] = useState({x: PONG_W / 2, y: PONG_H / 2, r: 5});
	const [position, setPosition] = useState('spec');
	const {socket} = useAppContext();
	const user = useUser();
	const navigate = useNavigate();
	
	useEffect(() => {
		return () => {
			if (Props.state.match){
				if (socket.ready){
					socket.emit("message", {sender :
						{id: user.id ,username: user.username, pos: position
					}, Roomtoken: Props.state.id, RoomType: "game", type: "leave"});
					Props.state.setSearching(false);
					Props.state.setMatch(false);
					setStart(false);
					reset();
					navigate("/home");
				}
			}
		}
	}, [socket.ready]);

	useEffect(() => {

		socket.on("game.count", (data: any) => {
			setCount(data.count);
		});
		socket.on("game.start", (data: any) => {
			setStart(true);
			setPosition(data.sender.pos);
		});
		socket.on("game.stop", (data: any) => {
			Props.state.setEnd(true);
			if (data.expt == "finish")
				Props.state.setMsgEnd(user.id == data.winner ? "winner" : "loser");
			else
				Props.state.setMsgEnd(data.expt);
			affEndGame();
		});

		socket.on("game.starting", (data: any) => {
			setPlayer1({y: PONG_H / 2 - PLAYER_H / 2, score: 0, color: data.player1.color})
			setPlayer2({y: PONG_H / 2 - PLAYER_H / 2, score: 0, color: data.player2.color});
		});

		socket.on("game.goal", (data: any) => {
			player1.score = data.rscore;
			player2.score = data.lscore;
		});

		socket.on("game.move", (data: any) => {
			if (data.sender.pos === "spec") return ;
			if (data.sender.pos === "left"){player1.y = data.sender.y * PONG_H / size.h;}
			if (data.sender.pos === "right"){player2.y = data.sender.y * PONG_H / size.h;}
		});
		socket.on("game.update", (data: any) => {
			setBall({x: data.x * size.w, 
				y: data.y * size.h, 
				r: 5});
		});
	}, [socket.ready, size, player1, player2])

	const affEndGame = () => {
		let count = 3;
		let inter = setInterval(() => {
			count--;
			if (count < 0) {
				clearInterval(inter);
				Props.state.setSearching(false);
				Props.state.setMatch(false);
				Props.state.setEnd(false);
				Props.state.setMsgEnd("");
				setStart(false);
				reset();
			}
		}, 1000);
	}
	
	const reset = () => {
		setPlayer1({y: size.h / 2 - (size.h / PLAYER_RATIO) / 2, score: 0, color: "#FFFFFFF"});
		setPlayer2({y: size.h / 2 - (size.h / PLAYER_RATIO) / 2, score: 0, color: "#FFFFFFF"});
		setBall({x: size.w / 2, y: size.h / 2, r: 5});
	}

	//----------------------------canva------------------------------------------

	const draw = (context: CanvasRenderingContext2D, size: any) => {
		context.fillStyle = player1.color || 'white';
		//player1 left
		context.fillRect(0, player1.y, PLAYER_W, size.h / PLAYER_RATIO);
		//player2 right
		context.fillStyle = player2.color || 'white';
		context.fillRect(size.w - PLAYER_W, player2.y,
			PLAYER_W, size.h / PLAYER_RATIO);
		//ball
		if (start) {
			context.beginPath();
			context.fillStyle = 'white';
			context.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2, false);
			context.fill();
		}
		//score
		context.fillStyle = 'white';
		context.font = "bold 48px serif";
		context.textAlign = "start";
		context.fillText(player1.score.toString(), size.w / 2 + 10, 40);
		context.textAlign = "end";
		context.fillText(player2.score.toString(), size.w / 2 - 10, 40);

		if (!start && count >= 0 && !Props.state.end) {
			let text = count.toString();
			context.fillStyle = 'white';
			context.font = "bold 48px serif";
			context.textAlign = "center";
			if (count == 0)
				text = "go";
			context.fillText(text, size.w / 2, size.h / 2);
		}

		if (Props.state.end && Props.state.msgEnd != ""){
			let text = Props.state.msgEnd
			context.fillStyle = 'white';
			context.font = "bold 48px serif";
			context.textAlign = "center";
			context.fillText(text, size.w / 2, size.h / 2);
		}
	};

	const resize = () => {
		let canvas = canvasRef.canvasRef.current;
		if (canvas){
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
			setSize({w: canvas.width, h: canvas.height});
		}
	};

	const canvasRef = useCanvas(size, draw, resize);

	useEffect(()=>{
		window.addEventListener("resize", resize, false);
		return () => window.removeEventListener("resize", resize);
	});
	
	const handleMove = (e: any) => {
		if (position === "spec")
			return ;
		let canvas = e.target;
		let canvaRect = canvas.getBoundingClientRect()
		let y = 0;
		if (canvaRect && socket.ready && start){
			let ph = (size.h / PLAYER_RATIO);
			y = (e.clientY - canvaRect.y) - (ph / 2);
			if (y <= 0)
				y = 0;
			else if (y >= size.h - ph)
				y = size.h - ph;
			if (position === "left") player1.y = y;
			if (position === "right") player2.y = y;
			socket.emit("message", {type: "movePaddle", RoomType: "game", Roomtoken: Props.state.id, sender:
				{id: user.id ,username: user.username, pos: position, y: y * size.h}})
		} 
	}

	//-------------------------------------------------------------------------------------

	return (
		<div className={styles.game}>
			<canvas className={styles.game_canvas} ref={canvasRef.canvasRef} onMouseMove={handleMove} width={PONG_W} height={PONG_H}/>
		</div>
	);
  };

  export default Game;