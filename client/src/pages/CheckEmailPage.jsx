import axios from 'axios';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import noUser from "../assets/noUser.avif"
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const CheckEmailPage = () => {
  const [data, setData] = useState({
    email: "",
  })
  const [laoding,setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const URL = `${import.meta.env.VITE_BACKEND_URL}/api/verify-email`; // Yeh sahi hai

    try {
      setLoading(true)
      const response = await axios.post(URL, data)
      const { data: responseData } = response
      if (responseData.success) {
        toast.success(responseData?.message);
        setData({
          email: "",
        })
        navigate("/password", {
          state: responseData
        })
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)
      console.log("Error", error)
      return error
    }finally{
      setLoading(false)
    }

  }

  const handleOnChange = (e) => {
    const { name, value } = e.target

    setData((preve) => {
      return {
        ...preve,
        [name]: value
      }
    })
  }

  return (
    <div className='mt-5'>
      <div className='bg-white w-full max-w-md  rounded overflow-hidden p-4 mx-auto'>
        <h3>Welcome to Chat app!</h3>
        <div className="mt-3 overflow-hidden h-20 w-20 rounded-full mx-auto">
          <img src={noUser} alt="" className='h-full w-full object-cover rounded-full' />
        </div>
        <form className='grid gap-4' onSubmit={handleSubmit}>


          <div className='flex flex-col gap-1'>
            <label htmlFor='email'>Email :</label>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Enter your email'
              className='bg-slate-100 px-2 py-1.5 focus:outline-primary'
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

          <button
            className='bg-primary text-lg  px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'
            type='submit'>
            {
              laoding ? <AiOutlineLoading3Quarters className='animate-spin text-xl mx-auto' /> : "Let's Go"
            }
          </button>

        </form>

        <p className='my-3 text-center'>Don't have account ? <Link to={"/register"} className='hover:text-primary font-semibold'>Register</Link></p>
      </div>
    </div>
  )
}

export default CheckEmailPage