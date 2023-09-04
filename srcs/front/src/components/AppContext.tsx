import { createContext, useContext } from 'react';
import useSocket from '../hooks/useSocket';

const AppContext = createContext<any>({
	socket: {
		on: (name: string, listenner: any) => { },
		once: (name: string, listenner: any) => { },
		off: (name: string, listenner: any) => { },
		emit: (type: string, data: any) => { },
		ready: false,
		id: null
	}
});

export type AppContextType = {
	socket: {
		on: (name: string, listenner: any) => { },
		once: (name: string, listenner: any) => { },
		off: (name: string, listenner: any) => { },
		emit: (type: string, data: any) => { },
		ready: boolean,
		id: string
	}
}

const useAppContext = (): AppContextType => useContext(AppContext);

const AppProvider = (props: any) => {
	const socket = useSocket("http://" + document.location.hostname + ":3000/");

	const defaultValue = {
		socket
	}

	return <AppContext.Provider value={defaultValue}>
		{props.children}
	</AppContext.Provider>
}

export { AppProvider, useAppContext };
export default AppContext;