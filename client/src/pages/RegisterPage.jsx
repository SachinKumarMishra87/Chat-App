import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'
import toast from 'react-hot-toast';
import { IoClose } from "react-icons/io5";
import uploadFile from '../helpers/UploadFile';
import noUser from "../assets/noUser.avif"
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const RegisterPage = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: ""
  })
  const [uploadPhoto, setUploadPhoto] = useState("")
    const [laoding, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleOnChange = (e) => {
    const { name, value } = e.target

    setData((preve) => {
      return {
        ...preve,
        [name]: value
      }
    })
  }

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];

    const uploadPhoto = await uploadFile(file)
    setUploadPhoto(file)
    setData((preve) => {
      return {
        ...preve,
        profile_pic: uploadPhoto?.url
      }
    })
  }

  const handleClearUploadPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadPhoto(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/register`; // Yeh sahi hai

    try {
      setLoading(true)
      const response = await axios.post(URL, data)
      const { data: responseData } = response
      if (responseData.success) {
        toast.success(responseData?.message);
        setData({
          name: "",
          email: "",
          password: "",
          profile_pic: ""
        })
        navigate("/email")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
      console.log("Error", error)
      return error
    }finally {
      setLoading(false)
    }

  }

  return (
    <div className='mt-3'>
      <div className='bg-white w-full max-w-md  rounded overflow-hidden p-4 mx-auto'>
        <h3>Welcome to Chat app!</h3>

        <div className="mt-3 overflow-hidden h-28 w-28 rounded-full mx-auto">
          <img src={data?.profile_pic || noUser} alt="" className='h-full w-full object-cover rounded-full' />
        </div>
        <form className='grid gap-4 ' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='name'>Name :</label>
            <input
              type='text'
              id='name'
              name='name'
              placeholder='Enter your name'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.name}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='email'>Email :</label>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Enter your email'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='password'>Password :</label>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Enter your password'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.password}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='profile_pic'>Photo :

              <div className='h-14 bg-slate-200 flex justify-center items-center border rounded hover:border-primary cursor-pointer'>
                <p className='text-sm max-w-[300px] text-ellipsis line-clamp-1'>
                  {
                    uploadPhoto?.original_filename ? uploadPhoto?.original_filename : "Upload profile pic"
                  }
                </p>
                {
                  uploadPhoto && (
                    <button className='text-lg ml-2 hover:text-red-600' onClick={handleClearUploadPhoto}>
                      <IoClose />
                    </button>
                  )
                }
              </div>
            </label>

            <input
              type='file'
              id='profile_pic'
              name='profile_pic'
              className='bg-slate-100 px-2 py-1 focus:outline-primary hidden'
              onChange={handleUploadPhoto}
            />
          </div>


          <button
            className='bg-primary text-lg  px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'
            type='submit'>
           {
            laoding ? <AiOutlineLoading3Quarters className='animate-spin text-lg mx-auto' /> : "Register"
           }
          </button>

        </form>

        <p className='my-3 text-center'>Already have account ? <Link to={"/email"} className='hover:text-primary font-semibold'>Login</Link></p>
      </div>
    </div>
  )
}

export default RegisterPage