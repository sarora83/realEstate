import React from 'react'
import { useSelector } from 'react-redux'
import { useRef, useState, useEffect } from 'react';
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import { app } from '../firebase';
import { updateUserStart, updateUserFailure, updateUserSuccess } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';

export default function Profile() {
  const {currentUser, loading, error} = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [fileperc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
  //service firebase.storage {
 // match /b/{bucket}/o {
  //  match /{allPaths=**} {
  //    allow read;
   //   allow write: if
   //   request.resource.size < 2 * 1024 * 1024 && 
   //   request.resource.contentType.matches('image/.*')

   useEffect(() => {
    if(file) {
      handleFileUpload(file);
    }}, [file]);

  const handleFileUpload = (file) => {

    const storage = getStorage(app);
    const filename = new Date().getTime() + file.name;
    const storageRef = ref(storage, filename)
    const uploadTask = uploadBytesResumable(storageRef, file);
    


    uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFilePerc(Math.round(progress));
        },

        (error) => {
          setFileUploadError(true);
        },

        () => {
          getDownloadURL(uploadTask.snapshot.ref).then
          ((downloadURL) => setFormData({ ...formData, avatar: downloadURL})
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
      try {
        dispatch(updateUserStart());
        const res = await fetch(`/api/user/update/${currentUser._id}`, {
            method : 'POST',
            headers: {
              'Content-Type' : 'application/json',
            },
            body: JSON.stringify(formData),

        });
        const data = await res.json();
        if (data.success === false){
          dispatch(updateUserFailure(data.message));
          return;
        }
        dispatch(updateUserSuccess(data));
        setUpdateSuccess(true);
        
      } catch (error) {
        dispatch(updateUserFailure(error.message));
      }
  }

  return (
    
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit = {handleSubmit} className='flex flex-col gap-4'>
        <input onChange = {(e) => setFile(e.target.files[0])} type= 'file' ref= {fileRef} hidden accept='image/.*'></input>
        <img onClick= {() => fileRef.current.click()} src={formData.avatar || currentUser.avatar} alt='profile' 
        className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' ></img>
        <p className='text-sm self-center'> {fileUploadError ? (
          <span className='text-red-700'>Error uploading image</span>) 
          :
          fileperc > 0 && fileperc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${fileperc}%`}</span>) 
          : fileperc == 100 ? (
            <span className='text-green-700'>Image uploaded successfully</span>
          )
          :
          ('')}
        </p>
        <input type='text'placeholder='username' id = 'username' defaultValue={currentUser.username}
        className='border p-3 rounded-lg'onChange={handleChange}></input>
        <input type='text'placeholder='email' id = 'email' defaultValue={currentUser.email}
        className='border p-3 rounded-lg'onChange={handleChange}></input>
        <input type='password'placeholder='password' onChange={handleChange} id = 'password' 
        className='border p-3 rounded-lg' ></input>
        <button disabled= {loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-80 disabled:opacity-50'>
          {loading ? 'loading...' : 'Update'}
          </button>
      </form>
      <div className='flex justify-between mt-3'>
        <span className='text-red-700 font-semibold cursor-pointer'>Delete account</span>
        <span className='text-red-700 font-semibold cursor-pointer'>Sign out</span>
      </div>
      <p className='text-red-700 font-semibold mt-5'>{error ? error: ""}</p>
      <p className='text-green-700 font-semibold mt-5'>{updateSuccess ? "User is updated successfully" : ""}</p>
      </div>
  )
}
