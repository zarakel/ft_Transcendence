import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import useUser from "./useUser";

const useSocket = (url: string): any => {
	const [socket, setSocket] = useState<Socket>();
	const [ready, setReady] = useState<boolean>(false);
	const user = useUser();
	useEffect(() => {
		if (!localStorage.getItem("jwt_token")) return;
		let socket = io(url, { forceNew: true });
		socket.on("connect", () => {
			if (user.username && user.id){
				socket.emit("connect_msg", {sender:{id: user.id, 
					username: user.username, mmr: user.mmr,login: user.login, color: user.color}});
				setReady(true);
			}
		});
		setSocket(socket);
		return () => {
			socket.disconnect();
			setReady(false);
		}
	}, [url])

	const emit = (type: string, data: any) => {
		if (socket){
			return socket.emit(type, data);
		}
	}

	const on = (name: string, listenner: any) => {
		if (socket)
			return socket.on(name, listenner);
	}

	const once = (name: string, listenner: any) => {
		if (socket)
			return socket.once(name, listenner);
	}

	const off = (name: string, listenner: any) => {
		if (socket)
			return socket.once(name, listenner);
	}

	return {
		current: socket, emit, on, once, off, ready
	}
}


export default useSocket;