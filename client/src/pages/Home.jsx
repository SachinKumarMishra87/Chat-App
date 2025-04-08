import React, { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { logout, setOnlineUser, setSocketConnection, setUser, setToken } from '../redux/userSlice'
import Sidebar from '../components/Sidebar'
import logo from '../assets/logo.png'
import io from "socket.io-client"

const Home = () => {
  const user = useSelector((state) => state?.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const token = localStorage.getItem("token");

  // Agar token nahi hai ya expire ho gaya hai, toh login page pe bhejo
  useEffect(() => {
    if (!token) {
      navigate("/email");
    }
  }, []);

  

  const fetchUserDetails = async () => {
    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/user-details`; // Yeh sahi hai

      const response = await axios({
        method: 'GET',
        url: URL,
        withCredentials: true, // Yeh sahi hai
        headers: {
          'Content-Type': 'application/json',
        },
      })

      dispatch(setUser(response.data.data))
      dispatch(setToken(response.data.token))

      if (response?.data?.logout) {
        dispatch(logout())
        navigate("/email")
      }

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchUserDetails()  // Yeh sahi hai
  }, [])

  // Socket connection
  useEffect(() => {
    const socketConnection = io(import.meta.env.VITE_BACKEND_URL, {
      auth: {
        token: localStorage.getItem("token")
      }
    })

    socketConnection.on("onlineUser", (data) => {
      dispatch(setOnlineUser(data))
    })
    dispatch(setSocketConnection(socketConnection))

    return () => {
      socketConnection.disconnect()
    }

  }, [])

  const basePath = location.pathname === "/";

  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      {/* Message section */}
      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      <div className={`${!basePath ? "hidden" : "lg:flex"} justify-center items-center flex-col gap-2 hidden`}>
        <div className="">
          <img src={logo} alt={user?.name} width={250} />
        </div>
        <p className='text-lg mt-2 text-slate-600 font-medium'>Select user to sende messgae</p>
      </div>
    </div>
  )
}

export default Home