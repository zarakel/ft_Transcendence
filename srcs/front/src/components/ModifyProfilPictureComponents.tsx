import React, { useEffect, useState } from 'react';
import {Buffer} from 'buffer';

const ModifyPictureComp = () => {

    function isFileImage(file: File | null) {
        return file && file['type'].split('/')[0] === 'image';
    }

    const [imageUrl, setImageUrl] = useState('');
    const [pseudo, setPseudo] = useState('');
    const [file, setFile] = useState<File>();
    const [displayMessage, setDisplayMessage] = useState<string>("");
    const [pseudoMessage, setPseudoMessage] = useState<string>("");


    let transformImage = async () => {

        const check: string | null = (localStorage.getItem('tmp_profile_pic'));
        
        let catch_fetch;
        let crypted_pic;
        
        if (check !== null)
        {
            var tmp_check = new String ( check );
            if (tmp_check.indexOf("data:image/") >= 0)
            {
                crypted_pic = check;
                return (crypted_pic); 
            }

            else {
                catch_fetch = await fetch(check);

                crypted_pic = Buffer.from(await catch_fetch.arrayBuffer()).toString('base64');
            }
            return (crypted_pic);
                
        }

        return ("");
    }	

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0)
    {   
        if (!isFileImage(event.target.files.item(0))){
            setDisplayMessage("false");
            return ;
        }
        const fileSizeMB = (event.target.files[0].size / (1024 * 1024));
        if (fileSizeMB > 5)
            {
                setDisplayMessage("false");
                return ;
            }
            const file = event.target.files[0];
            setFile(file);
            const imageUrl = URL.createObjectURL(file);
            setImageUrl(imageUrl);
            localStorage.setItem('tmp_profile_pic', imageUrl);
        }
    };

    const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        try{
            setImageUrl(event.target.value);
            localStorage.setItem("tmp_profile_pic", event.target.value);
        }
        catch{
            setDisplayMessage("false");
        }   
        
    };

    const handleImageSave = async () => {
        let Picture: Promise<string> = transformImage();
        if (await Picture === "")
        {
            localStorage.removeItem("tmp_profile_pic");
            return ;
        }
        try{
            let url = new URL(imageUrl);
            let request = await fetch("http://" + document.location.hostname + ":3000/user/picture_update",
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/json",
                    "cors": "true",
                    "Authorization": `Bearer ${localStorage.getItem("jwt_token")}`
                },
                body: JSON.stringify({profile_pic: (await Picture).toString(), login: localStorage.getItem("login")})
            });
            let res = await request.json();
            if (res.boolean)
            {
                localStorage.setItem('profile_pic', await Picture);
                localStorage.removeItem("tmp_profile_pic");
                setDisplayMessage("true");
            }
            else
            {
                localStorage.removeItem("tmp_profile_pic");
                setDisplayMessage("false");
            }
        }
        catch
        {
            setDisplayMessage("false");
            localStorage.removeItem("tmp_profile_pic");
        }
        setImageUrl("");
    };
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        let request = await fetch("http://" + document.location.hostname + ":3000/user/username_update",
            {
                method: "POST",
                headers:
                {
                    "Content-Type":  "application/json",
                    'cors': 'true',
                    'Authorization': `Bearer ${localStorage.getItem("jwt_token")}`
                },
                body: JSON.stringify({username: pseudo, login: localStorage.getItem("login")})
            }
        )
        let res = await request.json();
        if (res.boolean)
        {
            setPseudoMessage("true");
            localStorage.setItem("username", pseudo);
        }
        else if (!res.boolean)
        {
            setPseudoMessage("false");
        }
       	setPseudo("");
    };

    useEffect(() => {
        if (displayMessage) {
            setTimeout(() => {
                setDisplayMessage("");
            }, 3000);
        }
    }, [displayMessage]);

    useEffect(() => {
        if (pseudoMessage) {
            setTimeout(() => {
                setPseudoMessage("");
            }, 4000);
        }
    }, [pseudoMessage]);

    return (
        <div className="container mx-auto my-24 space-y-32">
            <div className=' space-y-10'>
                <div className="flex justify-center items-center">
                    <div className=" w-20 h-20 rounded-full overflow-hidden">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Profile Pic" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center w-full h-full bg-gray-200 flex justify-center items-center text-gray-400 cursor-default">
                        Pas d'image
                        </div>
                    )}
                    </div>
                </div>
                <div className="flex justify-center items-center mt-4 ">
                    <div className="flex mx-auto flex-col justify-around space-y-8 relative">
                        < div className="flex flex-row ">
                            <input type="text" value={imageUrl} onChange={handleImageUrlChange} className="outline-none border rounded-lg p-2 w-full z-1" placeholder="Entrer URL de l'image"  />
                            <button className="-ml-3 bg-sky-900 transition ease-in-out duration-300 hover:bg-sky-600 text-white rounded-l-none font-semibold py-2 px-4 rounded-lg z-0" onClick={handleImageSave}>
                                Sauvegarder
                            </button>                           
                        </div>
                        <div className="m-auto ">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="file-input" /> 
                            <label htmlFor="file-input" className="m-auto cursor-pointer rounded-lg p-2 hover:cursor-pointer bg-gray-100 hover:bg-gray-300 duration-300 transition ease-in-out">
                                Télécharger une image
                            </label>
                        </div>
                        <div className={`absolute h-12 text-md ml-2 transition-opacity ease-in-out delay-300 ${displayMessage === 'true' ? 'show text-green-500 left-[89px]' : ''} ${displayMessage === 'false' ? 'show text-red-500 left-[58px]' : ''}`}>
                            {displayMessage === "true" && 
                            <div>
                                Image sauvegardée
                            </div>
                            }
                            {displayMessage === "false" &&
                            <div>
                                Erreur lors de la sauvegarde
                            </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
			<div className="relative flex justify-center">
				<form onSubmit={handleSubmit} className="rounded bg-white">
					<input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} onKeyDown={(e) => {if (e.key == 'Enter') setPseudo(e.currentTarget.value)}}
                    placeholder="Votre nouveau pseudo" className="p-2 z-o rounded outline-none"/>
					<button type="submit" className="p-2 z-1 bg-gray-300 rounded transition ease-in-out duration-300 hover:bg-gray-500 hover:cursor-pointer">
						Envoyer
					</button>
				</form> 
                <div className={`absolute -top-16 text-md ml-2 transition-opacity ease-in-out delay-300 ${pseudoMessage === 'true' ? 'show text-green-500 -top-8' : ''} ${pseudoMessage === 'false' ? 'show text-red-500 ' : ''}`}>
                    {pseudoMessage === "true" && 
                    <div>
                        Pseudo sauvegardé
                    </div>
                    }
                    {pseudoMessage === "false" &&
                    <div className='text-center'>
                        Le pseudo ne doit contenir que des lettres et doit faire moins de 20 caractères et ne doit pas être déjà utilisé
                    </div>
                    }
                </div>
			</div>
		</div>
    );
};

export default ModifyPictureComp;
