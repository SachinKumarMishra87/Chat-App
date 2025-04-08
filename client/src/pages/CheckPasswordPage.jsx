import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/userSlice';

const CheckPasswordPage = () => {
    const [data, setData] = useState({
        password: "",
        userId: ""
    })
    const navigate = useNavigate()
    const location = useLocation();
    const [laoding, setLoading] = useState(false)
    const dispatch = useDispatch()
    const stateData = location?.state?.data

    useEffect(() => {
        if (!location?.state?.data) {
            navigate("/email")
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const URL = `${import.meta.env.VITE_BACKEND_URL}/api/verify-password`; // Yeh sahi hai

        try {
            setLoading(true)
            const response = await axios({
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                url: URL,
                data: {
                    userId: stateData?._id,
                    password: data.password
                },
                withCredentials: true
            });

            const { data: responseData } = response

            if (responseData.success) {
                toast.success(responseData?.message);
                dispatch(setToken(responseData.token))
                localStorage.setItem('token', responseData?.token)
                setData({
                    password: "",
                })
                navigate("/")
            }
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log("Error", error)
            return error
        } finally {
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
                    <Avatar userId={stateData?._id} name={stateData?.name} imageUrl={stateData?.profile_pic} width={"80"} height={"80"} />
                </div>
                <p className='mx-auto from-neutral-700 font-semibold text-center'>{stateData?.name}</p>
                <form className='grid gap-4' onSubmit={handleSubmit}>


                    <div className='flex flex-col gap-1'>
                        <label htmlFor='password'>Password :</label>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            placeholder='Enter your password'
                            className='bg-slate-100 px-2 py-1.5 focus:outline-primary'
                            value={data.password}
                            onChange={handleOnChange}
                            required
                        />
                    </div>

                    <button
                        className='bg-primary text-lg  px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'
                        type='submit'>
                        {
                            laoding ? <AiOutlineLoading3Quarters className='animate-spin text-xl text-center mx-auto' /> : "Login"
                        }
                    </button>

                </form>

                <p className='my-3 text-center'><Link to={"/forgot-password"} className='hover:text-primary font-semibold'>Forgot Password</Link></p>
            </div>
        </div>
    )
}

export default CheckPasswordPage