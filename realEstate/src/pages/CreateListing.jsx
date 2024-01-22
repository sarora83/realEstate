import React, { useState } from 'react';
import { getDownloadURL, getStorage , ref, uploadBytesResumable } from 'firebase/storage';
import {app} from '../firebase.js';
import { set } from 'mongoose';


export default function CreateListing() {
    const [files, setFiles] = useState([]);

    const [formData, setFormData] = useState({
        imageURLs : [],
    })
    const [imageUploadError,setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);
    console.log(formData);

    const handleImageUpload = (e) => {
        if (files.length > 0 && files.length + formData.imageURLs.length < 7  ) {
            setUploading(true);
            setImageUploadError(false);
            const promises = [];
            for (let i = 0; i < files.length; i++){
                promises.push(storeImage(files[i]));    
            }
            Promise.all(promises).then((urls) => {
                setFormData({ ...formData, imageURLs : formData.imageURLs.concat(urls) });
                setImageUploadError(false);
                setUploading(false);
                
        }).catch((err) => {
            setImageUploadError('Image upload failed 2 MB max per image');
            setUploading(false);
        });
            
    }
    else {
        setImageUploadError('Image upload failed. You can upload 6 images max');
        setUploading(false);
        }
        
    };


    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const filename = new Date().getTime() + file.name;
            const storageRef = ref(storage, filename);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on('state_changed', 
            (snapshot) => 
           
            {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                console.log(`Upload is ${progress}% done`);
            },
                (error) => {reject(error);},
                ()=> {
                    getDownloadURL(uploadTask.snapshot.ref).then ((downloadUrl) => {
                        resolve(downloadUrl);
                    })
                }
            );
            
        });
    };

    const handleRemoveImage = (index) => {
        setFormData({
          ...formData,
          imageURLs: formData.imageURLs.filter((_, i) => i !== index),
        });
      };
     
    
 return (
    <main className='p-3 max-w-4xl mx-auto'>
        <h1 className= 'text-3xl font-semibold text-center my-7'>Create a Listing</h1>
        <form className='flex flex-col sm:flex-row gap-4 '>
            <div className='flex flex-col gap-4 flex-1'>
                <input type='text' placeholder='Name' className='border p-3 rounded-lg' id= 'name'
                maxLength='60' minLength='10' required></input>
                <textarea type='text' placeholder='Description' className='border p-3 rounded-lg' id= 'description'
                 required></textarea>
                <input type='text' placeholder='Address' className='border p-3 rounded-lg' id= 'address'
                 required></input>
                 <div className='flex gap-6 flex-wrap'>
                    <div className='flex gap-2'>
                        <input type ='checkbox' id= 'sale'className='w-5'></input>
                        <span>Sell</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type ='checkbox' id= 'rent'className='w-5'></input>
                        <span>Rent</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type ='checkbox' id= 'parking'className='w-5'></input>
                        <span>Parking</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type ='checkbox' id= 'furnished'className='w-5'></input>
                        <span>Furnished</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type ='checkbox' id= 'offer'className='w-5'></input>
                        <span>Offer</span>
                    
                    </div>
                 </div>
                 <div className='flex flex-wrap gap-6'>
                    <div className='flex items-center gap-2'>
                        <input type= "number" id='bedrooms' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg'></input>
                        <p>Beds</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <input type= "number" id='bathrooms' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg'></input>
                        <p>Baths</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        
                        <input type= "number" id='regularPrice' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg'></input>
                        <div className='flex flex-col items-center'>
                        <p>Regular Price</p>
                        <span className='text-xs'>($/month)</span>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <input type= "number" id='discountPrice' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg'></input>
                        <div className='flex flex-col items-center'>
                        <p>Discounted Price</p>
                        <span className='text-xs'>($/month)</span>
                    </div>
                    </div>
                 </div>
            </div>
            <div className='flex flex-col flex-1 gap-4'>
                <p className='font-semibold'>Images:</p>
                <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span>
                <div className='flex gap-4'>
                    <input  onChange={(e) => setFiles(e.target.files)}
                     className='p-3 border border-gray-400 rounded w-full' 
                     type='file' id= "images" accept='image/*' 
                     multiple></input>
                    
                    <button type ='button' disabled={uploading} onClick= {handleImageUpload} 
                    className='p-3 text-green-700 border border-green-700 rounded-lg uppercase hover:shadow-lg disabled:opacity-70'>
                        
                        {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    
                </div>
                <p className='text-red-700 text-sm'>{imageUploadError && imageUploadError}</p>
                {
                    formData.imageURLs.length > 0 && formData.imageURLs.map((url, index) => (
                        <div key={url} className="flex justify-between p-3 border items-center gap-4">
                        <img src={url} alt='listing image' className='rounded-lg w-20 h-20 object-contain' />
                        <button type='button' onClick={() => handleRemoveImage(index)} className='p-3 text-red-700 rounded-lg uppercase hover:opacity-95 disabled:opacity-75'>Delete</button>
                        </div>
                    ))
                }
                <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-75'>Create Listing</button>
            </div>
            
        </form>
    </main>
  )
}

