import { FC } from 'react';
import './App.css';
import { BrowserRouter, Route, Navigate } from "react-router-dom";
import { Routes } from "react-router";
import Home from './pages/Home';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Profil from './pages/Profil';
import Game from './components/Game';
import MatchHistory from './pages/DeepProfil/MatchHistory';
import ModifyPicture from './pages/DeepProfil/ModifyProfilePicture';
import TFA from './pages/DeepProfil/2FA';
import OtherProfil from './pages/OtherProfil';
import QuatresCentQuatres from './pages/QuatresCentQuatres';
import { AppProvider } from './components/AppContext';
  

const App: FC = () => {

	function PrivateRoute({children} : {children: JSX.Element}) {
		if (!localStorage.getItem("jwt_token")) {
			return <Navigate to="/"/>
		}
		return children;
	}

	return (
	<AppProvider>
		<BrowserRouter>
      		<Routes>
				<Route element={<Login />} path="/" />
					<Route path="/home" element={
						<PrivateRoute>
							<Home/>
						</PrivateRoute>} 
		/>
		<Route element={			
			<PrivateRoute>
				<Home/>
			</PrivateRoute>} path="/home/:id" />
		<Route element={			
			<PrivateRoute>
				<Chat/>
			</PrivateRoute>} path="/home/chat" />
			<Route element={			
			<PrivateRoute>
				<Chat/>
			</PrivateRoute>} path="/home/chat/:id" />
			<Route element={			
			<PrivateRoute>
				<OtherProfil/>
			</PrivateRoute>} path="/home/other_profil" />
		<Route element={			
			<PrivateRoute>
				<Profil/>
			</PrivateRoute>}  path="/home/profil" />
		<Route element={			
			<PrivateRoute>
				<ModifyPicture/>
			</PrivateRoute>}  path="/home/profil/modify_picture" />
		<Route element={			
			<PrivateRoute>
				<Game/>
			</PrivateRoute>}  path="/game" />
		<Route element={			
			<PrivateRoute>
				<MatchHistory/>
			</PrivateRoute>}  path="/home/profil/match_history" />
			<Route element={			
			<PrivateRoute>
				<TFA/>
			</PrivateRoute>}  path="/home/profil/2fa" />
			<Route element={<QuatresCentQuatres />} path="*" />
      </Routes>
    </BrowserRouter>
	</AppProvider>
	);
  };

export default App;