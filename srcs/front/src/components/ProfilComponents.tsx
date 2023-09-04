import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import styles from "../styles/color.module.scss";

export const LocalStorageCheck = (test: string | null) => {
	if (test)
		return test;
	return "";
  }

  interface User{    
    level: number;
    win: number;
    lose: number;
    mmr: number;
    }

const ProfilComponents = () => {
    let c = localStorage.getItem("pad_color");
    const [color, setColor] = useState(c == null ? "" : c);
    const [displayMessage, setDisplayMessage] = useState(false);
    const [colorPicked, setColorPicked] = useState(false);
    const [user, setUser] = useState<User>({level: 0, win: 0, lose: 0, mmr: 0});

    const castImage = () => {
		let pic: string;
		const check: string | null = localStorage.getItem('profile_pic');
		try {
			if (check !== null) {
                var tmp_check = new String ( check );
                if (tmp_check.indexOf("data:image/") >= 0)
                    pic = check;
                else 
                    pic = "data:image/png;base64," + check;
				return (pic);
			}
		} catch (error) {
			console.error("the content of profile_pic isn't right: ", error);
		}
	}

    const checkUser = async (setUser: any) => {
        const url = `http://${document.location.hostname}:3000/user/user_update/${LocalStorageCheck(localStorage.getItem('id'))}`;
        const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "cors": "true",
            "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        }
        });
        let data: User = await response.json();
        if (data) {
            setUser(data);
        }
    }

    useEffect(() => {
        checkUser(setUser);
    }, []);

    const changePadColor = async () => {
        const url = `http://${document.location.hostname}:3000/user/pad_update/`;
        const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "cors": "true",
            "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
        }
        , body: JSON.stringify({ new_color: color })
        });
        let data = await response.json();
        localStorage.setItem('pad_color', color);
        if (colorPicked)
            setDisplayMessage(true);
    }
    
    const handleColorChange = async (event: any) => {
        setColor(event.target.value);
        setColorPicked(true);
    }

    useEffect(() => {
        if (displayMessage && colorPicked) {
            setTimeout(() => {
                setDisplayMessage(false);
                setColorPicked(false);
            }, 3000);
        }
    }, [displayMessage]);

    return (
        <div className="w-full flex justify-around flex-col my-12 space-y-16">
            <div className="flex flex-columns-3 mx-auto text-center text-white hover:rounded ">
                <Link className="basis-1/3 font-bold text-2xl transition ease-in-out p-4 hover:scale-110 hover:text-sky-500 hover:cursor-pointer " to="/home/profil/2FA">
                        Authentification 2 facteurs
                </Link>
                <Link className="basis-1/3 font-bold text-2xl transition ease-in-out p-4 hover:scale-110 hover:text-sky-500 hover:cursor-pointer" to="/home/profil/match_history">
                        Accéder au Match History
                </Link>
                <Link className="basis-1/3 font-bold text-2xl transition ease-in-out p-4 hover:scale-110 hover:text-sky-500 hover:cursor-pointer" to="/home/profil/modify_picture">
                    Changer son image de profil ou son pseudo
                </Link>
            </div>
            {/* <div className="flex flex-col-3 text-center justify-around text-white hover:rounded "> */}
            <div className="flex flex-col text-center justify-around text-white hover:rounded ">
                <div className="flex flex-col mx-auto test-xl w-1/3 space-y-10 group-hover:block hover:rounded hover:border hover:border-white transition ease-in-out p-4 hover:bg-sky-700">
                    <div className=" flex flex-row m-auto space-x-8 justify-center">
                        <img src={castImage()} className="flex float-left w-20 h-20 rounded-full object-cover" alt=""/>
                        <h1 className="flex text-3xl mt-5 font-bold italic">
                            {localStorage.getItem('username')}
                        </h1>
                    </div>
                    <h1>
                        Win {user.win} | Lose {user.lose}
                    </h1> 
                    <h1>
                        Level {user.level}
                    </h1> 
                    <h1>
                        MMR {user.mmr}
                    </h1>
                    <div className="flex flex-col mx-auto space-y-3">
                        <h1>
                        Pad color
                        </h1>
                            <input className="mx-auto " type="color" id="colorpicker" value={color} onChange={handleColorChange}/>
                            <button className={styles.modernbutton} onClick={changePadColor}>Valider</button>
                    </div>
                </div>
                    {displayMessage && colorPicked &&
                    <div className="text-green-500 flex mx-auto">
                        Couleur sauvegardée
                    </div>
                    }
            </div>
        </div>
    );
};

export default ProfilComponents;