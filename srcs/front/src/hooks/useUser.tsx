import { useEffect, useState } from "react";

const useUser = () => {
	const [id, setId] = useState(localStorage.getItem("id"));
	const [username, setUsername] = useState(localStorage.getItem("username"));
	const [mmr, setMmr] = useState(localStorage.getItem("mmr"));
	const [color, setColor] = useState(localStorage.getItem("pad_color"));
	const [login, setLogin] = useState(localStorage.getItem("login"));

	useEffect(() => {
		
		let id = localStorage.getItem("id");
		let username = localStorage.getItem("username");
		let mmr = localStorage.getItem("mmr");
		let color = localStorage.getItem("pad_color");
		let login = localStorage.getItem("login");

		if (id) setId(id);
		if (username) setUsername(username);
		if (mmr) setMmr(mmr);
		if (color) setColor(color);
		if (login) setLogin(login);

		return () => {};
	}, []);

	return {id, username, login, mmr, color, setId, setUsername, 
		setMmr, setColor, setLogin}
}

export default useUser;