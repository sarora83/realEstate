import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

export default function contact({listing}) {
  
   const [landlord, setLandlord] = useState(null);
   const [message, setMessage] = useState('');

   const onChange = (e) => {
    setMessage(e.target.value);

   }

   useEffect( () => {

    const fetchLandlord = async () => {
        try{
      const res = await fetch(`/api/user/${listing.userRef}`);
      const data = await res.json();
      setLandlord(data);
    }
    catch(error){
    
        console.log(error);
   }
}
    fetchLandlord();
}, [listing.userRef])
   return (
    <>
    {landlord && (
        <div className='flex flex-col gap-2'>
            <p> Contact <span className='font-semibold'>{landlord.username}</span> for 
            <span className='font-semibold' >{listing.name.toLowerCase()}  </span></p>
            
            <textarea className='w-full border p-3 rounded h-32 bg-gray-200'name= "message" id= "message" rows= '2' value={message}
            onChange={onChange} placeholder='Enter your message here....'></textarea>
            <Link
            to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
            className='bg-blue-400 text-white text-center p-3 uppercase rounded-lg hover:opacity-75'
            >Send Message
            </Link>

        </div>


    )}
    
    
    
    
    </> 
  )
}

