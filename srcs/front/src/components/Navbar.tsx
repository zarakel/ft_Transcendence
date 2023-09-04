import logonav from "../pod blanc.svg"
import profil from "../profil.svg"
import { Link, useNavigate, useLocation } from "react-router-dom";
import disconnect from "../disconnect.svg"
import loupe from "../loupe.svg"
import { useEffect, useState } from "react";
import useUser from "../hooks/useUser";
import { useAppContext } from "./AppContext";
import manette from "../manette.svg"
import pastilleVerte from "../pastilleVerte.svg"
import deco from "../deco.svg"

interface User {
    id: number;
    username: string;
    login: string;
    profile_pic: string;
    mmr: number; 
    tfa_secret: string;
    tfa_enable: boolean
    win: number;
    lose: number;
    online: boolean;
    ingame: boolean;
	friend: boolean;
}

interface Signal {
	ProfilSignal: boolean;
	HomeSignal: boolean;
}

const Navbar = (Props: any) => {
    const  me = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [check, setCheck] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const { socket } = useAppContext();
    const user = useUser();
    const location = useLocation();
    const navigate = useNavigate();

    
    function handleDropdownClick() {
        setIsOpen(!isOpen);
    }
    /* ------------------------------ */

    useEffect(() => {
        if (isOpen)
            getUserConnected();
      }, [isOpen]);
      
    /* A changer pour meilleur perf */

    const logOut = async () => {
        socket.emit("goodbye", {sender : {id: user.id,username: user.username}});
        localStorage.clear();
        document.location.href = "http://" + document.location.hostname
    }

    const handleClick = async (e: any) => {
        if (location.pathname === "/home/other_profil")
            navigate(0);
    }

    const getUserConnected = async () => {
        const url = `http://${document.location.hostname}:3000/user/get_players`;
        const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "cors": "true",
            "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        	}
        });
        let data: any = await response.json();
        if (data && data.length > 0)
        {
            setUsers(data.filter((item: any) => item.id != me.id));
            setCheck(true);
        }
    }

	const setImage = (user: any): string => {
		if (user.ingame)
			return manette;
		else if (user.online)
			return pastilleVerte;
		return deco;
	}

    return (
        <div className="flex flex-row w-screen my-10 h-20 justify-around transition ease-in-out hover:bg-sky-700">
			{ !Props.HomeSignal &&  
            <div className="flex my-auto justify-center w-1/3 space-x-3">
                <div className="dropdown ">
                   <button className="dropdown-toggle " onClick={handleDropdownClick}>
                   <img src={loupe} className="w-7 h-7 mt-1" />
                   </button>
                   {isOpen && users.length > 0 && (
                   <div className="absolute dropdown-menu bg-gray-400 shadow rounded border border-gray-400 flex flex-col">
                       {users.map((user) => (
                       <button key={user.id} onClick={handleClick} className="dropdown-item p-1  text-gray-800 hover:bg-gray-300 transition ease-in-out duration-300">
                       <Link className={user.friend ? "text-green-200" : "text-white"} to= "/home/other_profil" state= {{ username : user.username }} >
                       <img src={setImage(user)} className="w-6 h-6 float-left"/>                   
                        &nbsp;{user.username}
                        </Link>
                       </button>
                       ))}
                   </div>
                   )}
                </div>
                <div className="transition ease-in-out hover:scale-110 hover:cursor-pointer">
                    <h1 className="text-2xl text-white my-auto ">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="black" className="w-6 my-1 mx-1 float-left">
					<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
					</svg>
                        <Link to="/home"> Home</Link>
                    </h1>
                </div>
            </div>
			}
			{ Props.HomeSignal &&
			<div className="flex my-auto  justify-center w-1/3 space-x-3">
                <div className="dropdown">
                   <button className="dropdown-toggle" onClick={handleDropdownClick}>
                   <img src={loupe} className="w-7 h-7 mt-1" />
                   </button>
                   {isOpen && users.length > 0 && (
                   <div className="flex flex-col dropdown-menu bg-gray-400 shadow rounded border border-gray-400 absolute">
                       {users.map((user) => (
                       <button key={user.id} className="dropdown-item p-1 text-gray-800 hover:bg-gray-300 transition ease-in-out duration-300">
                            <Link className={user.friend ? "text-green-200" : "text-white"} to= "/home/other_profil" state= {{ username : user.username }}>
								<img src={setImage(user)} className="w-6 h-6 float-left"/>
                            	{user.username}
                            </Link>
                       </button>
                       ))}
                   </div>
                   )}
                </div>
				<div className="transition ease-in-out hover:scale-110 hover:cursor-pointer">
					<h1 className="text-2xl text-white my-auto ">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="black" className="w-7 my-1 mx-1 float-left">
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/>
						</svg>
						<Link to="/home/chat"> Chat</Link>
					</h1>
				</div>
			</div>
			}
            <div className="flex w-1/3">
                <img src={logonav} className="mx-auto  scale-75 fill-black " alt="" />
            </div>

            <div className="justify-center w-1/3 flex container-sm">
				{!Props.ProfilSignal &&
				<div className="flex transition ease-in-out hover:scale-110 hover:cursor-pointer">
					<h1 className=" my-auto text-2xl text-white">
						<img src={profil} className=" w-7 my-1 mx-1 float-right" />
						<Link to="/home/profil"> Profil</Link>
					</h1>
				</div>
				}
				{Props.ProfilSignal &&
                <div className="flex transition ease-in-out hover:scale-110 hover:cursor-pointer">
                    <h1 className=" my-auto text-2xl text-white">
                        <img src={profil} className=" w-7 my-1 mx-1 float-right" />
                        <Link to="/home/chat"> Chat</Link>
                    </h1>
                </div>
				}
                <div className="flex-row flex transition ease-in-out hover:scale-110 hover:cursor-pointer ">
                    <div className="flex my-auto ">
                        <span> &nbsp; &nbsp;</span>
                        <button onClick={logOut}><img src={disconnect} className=" w-6 "/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;