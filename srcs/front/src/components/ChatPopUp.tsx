import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


const ChatPopUp = (Props: any) => {

    const navigate = useNavigate();
    let count = 0;

    useEffect(() => {
        const inter = setInterval(() => {
            if (count < 10)
                count = count + 1;
            else{
                clearInterval(inter);
                Props.state.setChatPopUp(false);
                count = 0;
            }
        }, 1000)
    }, []);

    return (
        <div className="absolute left-[9%] top-36 border rounded p-2 border-white bg-gray-600 text-white text-md space-y-2">
            <h1> Vous avez reçu un message privé </h1>
            <div>
                {Props.state.bouboule && 
                    <div className="flex flex-row justify-evenly">
                    <button className=" text-sm bg-black p-1 rounded border border-white " onClick={() => {document.location.href = "/home/chat"}}> Rejoindre </button>
                    <button className=" text-sm bg-black p-1 rounded border border-white " onClick={() => {Props.state.setChatPopUp(false);}}> Rester </button>
                    </div>
                }
                {!Props.state.bouboule &&
                    <div className="flex flex-row justify-evenly">
                    <button className=" text-sm bg-black p-1 rounded border border-white " onClick={() => {navigate("/home/chat/",{state:{channelToken:Props.state.channelToken}}); Props.state.setChatPopUp(false); }}> Rejoindre </button>
                    <button className=" text-sm bg-black p-1 rounded border border-white " onClick={() => {Props.state.setChatPopUp(false);}}> Rester </button>
                    </div>
                }
            </div>
        </div>
    );
};

export default ChatPopUp;