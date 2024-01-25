import React, { useEffect, useState } from 'react';
import { getDownloadURL, getStorage , ref, uploadBytesResumable } from 'firebase/storage';
import {app} from '../firebase.js';
import { set } from 'mongoose';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';


export default function UpdateListing() {
    const [files, setFiles] = useState([]);
    const navigate = useNavigate();
    const params = useParams();
    const {currentUser} = useSelector(state => state.user);
    const [formData, setFormData] = useState({
        imageURLs : [],
        name: '',
        description: '',
        address: '',
        type: 'rent',  
        bedrooms: '1',
        bathrooms: '1',
        regularPrice: '1000',
        discountPrice: '0', 
        offer: false,
        parking: false,
        furnished: false,
    });
    const [imageUploadError,setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const fetchListing = async () => {
            const listingid = params.listingId;
            const res = await fetch(`/api/listing/get/${listingid}`);
            const data = await res.json();
            setFormData(data);
            if (data.success === false) {
                setError(data.message);
              }
        }
        fetchListing();
    }, []);

   //console.log(formData);

  /**
   * handleImageUpload uploads images to Firebase Storage.
   * It takes in the event from the file input change.
   * It checks that the total number of files and existing URLs is less than 7.
   * It sets the uploading state to true and clears any errors.
   * It creates promises to upload each file.
   * It waits for the promises to resolve, concats the URLs to state.
   * If there's an error, it surfaces it in state.
   * Finally it sets the uploading state to false.
   */
  const handleImageUpload = (e) => {
    if (files.length > 0 && files.length + formData.imageURLs.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      /**
       * Handles promise resolution for uploading images.
       * Called when all image upload promises have resolved successfully.
       */
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageURLs: formData.imageURLs.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image upload failed 2 MB max per image");
          setUploading(false);
        });
    } else {
      setImageUploadError("Image upload failed. You can upload 6 images max");
      setUploading(false);
    }
  };


  /**
   * Uploads a file to Firebase Storage and returns a promise with the download URL.
   *
   * @param {File} file - The file to upload
   * @returns {Promise<string>} A promise that resolves with the download URL
   */
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const filename = new Date().getTime() + file.name;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            resolve(downloadUrl);
          });
        }
      );
    });
  };

  /**
   * Removes an image from the form data by filtering out the image at the given index.
   * @param {number} index - The index of the image to remove.
   */
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageURLs: formData.imageURLs.filter((_, i) => i !== index),
    });
  };
     
  /**
   * Handle change event for form inputs
   * Update formData state with new input values
   */
  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  /**
   * handleSubmit function handles submitting the form data to create a new listing.
   * It takes in the submit event, prevents default behavior, makes API call to /listing/create
   * endpoint with form data, handles response and any errors, and navigates to the new listing page.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageURLs.length < 1)
        return setError("You must upload at least one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError(
          "The regular price must be greater than the discount price"
        );
      setLoading(true);
      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
 return (
    <main className='p-3 max-w-4xl mx-auto'>
        <h1 className= 'text-3xl font-semibold text-center my-7'>Edit a Listing</h1>
        <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4 '>
            <div className='flex flex-col gap-4 flex-1'>
                <input type='text' placeholder='Name' className='border p-3 rounded-lg' id= 'name'
                maxLength='60' minLength='10' required onChange={handleChange} value={formData.name}></input>
                <textarea type='text' placeholder='Description' className='border p-3 rounded-lg' id= 'description'
                 required onChange={handleChange} value={formData.description}></textarea>
                <input type='text' placeholder='Address' className='border p-3 rounded-lg' id= 'address'
                 required onChange={handleChange} value={formData.address}></input>
                 <div className='flex gap-6 flex-wrap'>
                    <div className='flex gap-2'>
                        <input type ='checkbox' id= 'sale'className='w-5' onChange={handleChange} checked={formData.type === 'sale'}></input>
                        <span>Sell</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type ='checkbox' id= 'rent' className='w-5' onChange={handleChange} checked={formData.type === 'rent'}></input>
                        <span>Rent</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type ='checkbox' id= 'parking'className='w-5' onChange={handleChange} checked={formData.parking}></input>
                        <span>Parking</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type ='checkbox' id= 'furnished'className='w-5'onChange={handleChange} checked={formData.furnished}></input>
                        <span>Furnished</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type ='checkbox' id= 'offer'className='w-5'onChange={handleChange} checked={formData.offer}></input>
                        <span>Offer</span>
                    
                    </div>
                 </div>
                 <div className='flex flex-wrap gap-6'>
                    <div className='flex items-center gap-2'>
                        <input type= "number" id='bedrooms' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg'
                        onChange={handleChange} value={formData.bedrooms}></input>
                        <p>Beds</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <input type= "number" id='bathrooms' min='1' max='10' required className='p-3 border border-gray-300 rounded-lg'
                        onChange={handleChange} value={formData.bathrooms}></input>
                        <p>Baths</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        
                        <input type= "number" id='regularPrice' min='1000' max='20000' required className='p-3 border border-gray-300 rounded-lg'
                        onChange={handleChange} value={formData.regularPrice}></input>
                        <div className='flex flex-col items-center'>
                        <p>Regular Price</p>
                        <span className='text-xs'>(Rs/month)</span>
                        </div>
                    </div>
                    {formData.offer &&(
                        <div className='flex items-center gap-2'>
                        <input type= "number" id='discountPrice' min='0' max='20000' required className='p-3 border border-gray-300 rounded-lg'
                        onChange={handleChange} value={formData.discountPrice}></input>
                        <div className='flex flex-col items-center'>
                        <p>Discounted Price</p>
                        <span className='text-xs'>(Rs/month)</span>
                    </div>
                    </div>
                    )}
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
                <button disabled ={loading || uploading} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-75'>
                    {loading? 'Editing List...' : 'Edit Listing'}
                 </button>
                 {error && <p className='text-red-700 mt-5'>{error}</p>}
            </div>
            
        </form>
    </main>
  )
}

