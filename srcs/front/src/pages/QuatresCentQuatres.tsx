import { Link } from 'react-router-dom'
import gif from "../404.gif"

const QuatresCentQuatres = () => { 

	return  (
		<div className="flex flex-col items-center justify-center h-screen w-screen">
			<div className="m-auto text-center">
				<Link to="/" className="text-red-400 underline text-2xl ease-in-out transition delay-150 hover:cursor-pointer hover:scale-110"> Allez-vous en. </Link> 
				<img src={gif} alt="404"/>
				<div className="mt-16">
					<span className="text-red-800 text-2xl font-semibold my-10"> C'est le repère de </span>
					<span className="text-red-600 text-2xl font-bold my-10"> 404 </span>
					<span className="text-red-800 text-2xl font-semibold my-10"> ici. </span>				
				</div>
			</div>
		</div>	
	);
  };

  export default QuatresCentQuatres;