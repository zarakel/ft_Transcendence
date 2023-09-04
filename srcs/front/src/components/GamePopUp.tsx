import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppContext } from "./AppContext";


const GamePopUp = (Props: any) => {

    const navigate = useNavigate();
    const {socket} = useAppContext();
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
			setElapsedTime((prevElapsedTime) => prevElapsedTime + 1000); // Ajoute 1000 ms à chaque intervalle (1 seconde)
		  }, 1000);

		if (elapsedTime >= 30000)
          Refute(), clearInterval(interval);
    }, [elapsedTime]);

    const Refute = () => {
        socket.emit("message", {sender :
				{ id : Props.state.user.id ,username: Props.state.user.username
				}, Roomtoken: Props.state.gameToken, RoomType: "game", type: "leave"});
        Props.state.setGamePopUp(false);
    }

    const Navigation = () => {
	    navigate(`/home/${Props.state.gameToken}`);
        /** socket.emit debilos d'activation booleene */
        Props.state.setGamePopUp(false);
    }
    
    return (
        <div className="absolute left-[9%] top-36 border rounded p-2 border-white bg-gray-600 text-white text-md space-y-2">
            <h1> Vous avez reçu une invitation à jouer ! </h1>
            <div className="flex flex-row justify-evenly">
                <button className=" text-sm bg-black p-1 rounded border border-white " onClick={Navigation}> Rejoindre </button>
                <button className=" text-sm bg-black p-1 rounded border border-white " onClick={Refute}> Rester </button>
            </div>
        </div>
    );
};

export default GamePopUp;