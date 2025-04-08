import React, { useEffect, useState } from 'react'
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { FaImage, FaUserPlus, FaVideo } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import Avatar from "./Avatar"
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import { FiArrowUpLeft } from 'react-icons/fi';
import SearchUser from './SearchUser';
import { logout } from '../redux/userSlice';


const Sidebar = () => {

    const user = useSelector((state) => state?.user);
    const [editUserOpen, setEditUserOpen] = useState(false)
    const [allUser, setAllUser] = useState([]);
    const [openSearchUser, setOpenSearchUser] = useState(false)
    const socketConnection = useSelector((state) => state?.user?.socketConnection)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (socketConnection) {
            socketConnection.emit("sidebar", user?._id)

            socketConnection.on("conversation", (data) => {

                const conversationUserData = data.map((conversationUser, index) => {
                    if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.sender
                        }

                    }
                    else if (conversationUser?.receiver?._id !== user?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.receiver
                        }

                    }
                    else {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.sender
                        }
                    }
                })

                setAllUser(conversationUserData)
            })
        }

    }, [socketConnection, user])

    const handleLogout = () => {
        dispatch(logout())
        navigate("/email")
        localStorage.clear()
    }

    return (
        <div className='w-full h-full grid grid-cols-[48px,1fr] bg-white'>
            <div className="bg-slate-300 text-slate-600 w-12 h-full rounded-tr-lg rounded-br-lg py-5 flex flex-col justify-between">
                <div className="">
                    <NavLink title='Chat' className={({ isActive }) => `w-10 h-10  flex items-center justify-center rounded-full cursor-pointer hover:bg-slate-400 transition-all duration-300 ease-in-out mx-auto mb-5 ${isActive ? "bg-slate-400" : ""}`}>
                        <IoChatbubbleEllipsesSharp size={25} />
                    </NavLink>
                    <div title='Add friends' onClick={() => setOpenSearchUser(true)} className="w-10 h-10  flex items-center justify-center rounded-full cursor-pointer hover:bg-slate-400 transition-all duration-300 ease-in-out mx-auto mb-5">
                        <FaUserPlus size={24} />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <button onClick={() => setEditUserOpen(true)} title={user?.name} >
                        <Avatar
                            width={35}
                            height={35}
                            name={user?.name}
                            imageUrl={user?.profile_pic}
                            userId={user?._id}
                        />
                    </button>
                    <button onClick={handleLogout} title='Logout' className='w-10 h-10 flex items-center justify-center rounded-full cursor-pointer hover:bg-slate-400 transition-all duration-300 ease-in-out mx-auto'>
                        <span className='-ml-1'>
                            <BiLogOut size={23} />
                        </span>
                    </button>
                </div>

            </div>

            <div className="w-full">
                <div className="h-16 flex items-center justify-center">
                    <h2 className='text-xl p-4 font-bold text-slate-800'>Message</h2>
                </div>
                {/* Divider */}
                <div className="bg-slate-200 p-[0.5px]">

                </div>
                <div className={`h-[calc(100vh-65px)] overflow-x-hidden ${allUser?.length === 0 ? "overflow-y-hidden" : "overflow-y-auto"} scrollbar`}>
                    {
                        allUser?.length === 0 && (
                            <div className="mt-14">
                                <div onClick={() => setOpenSearchUser(true)} className="flex items-center justify-center my-4 text-slate-500">
                                    <FiArrowUpLeft size={50} />
                                </div>
                                <p className='text-lg text-center text-slate-400'>Explore users to start a conversation with.</p>
                            </div>
                        )
                    }

                    {
                        allUser?.map((conv, index) => {
                            return (
                                <NavLink to={"/" + conv?.userDetails?._id} key={index + conv?._id} className="flex items-center gap-2 py-3 px-2 border-b hover:bg-slate-100 border-transparent hover:border-primary transition-all duration-200 ease-in-out cursor-pointer">
                                    <div className="">
                                        <Avatar
                                            imageUrl={conv?.userDetails?.profile_pic}
                                            name={conv?.userDetails?.name}
                                            height={40}
                                            width={40}
                                            userId={conv?.userDetails?._id}
                                        />
                                    </div>

                                    <div className="">
                                        <h3 className='text-ellipsis line-clamp-1 font-semibold text-base '>{conv?.userDetails?.name}</h3>
                                        <div className="text-slate-500 text-sm flex items-center gap-1">
                                            <div className='flex items-center gap-1'>
                                                {
                                                    conv?.lastMsg?.imageUrl && (
                                                        <div className='flex items-center gap-1 '>
                                                            <span><FaImage size={13} /></span>
                                                            {!conv?.lastMsg?.text && <span>Image</span>}
                                                        </div>
                                                    )
                                                }
                                                {
                                                    conv?.lastMsg?.videoUrl && (
                                                        <div className='flex items-center gap-1'>
                                                            <span><FaVideo size={13} /></span>
                                                            {!conv?.lastMsg?.text && <span>Video</span>}
                                                        </div>
                                                    )
                                                }
                                            </div>
                                            <p className='text-ellipsis line-clamp-1'>{conv?.lastMsg?.text}</p>
                                        </div>
                                    </div>

                                    {
                                        conv?.unseenMsg > 0 && (
                                            <p className='text-xs ml-auto w-5 h-5 p-1 flex justify-center items-center bg-primary text-white font-semibold rounded-full'>{conv?.unseenMsg}</p>
                                        )
                                    }
                                </NavLink>
                            )
                        })

                    }
                </div>
            </div>



            {
                editUserOpen && (
                    <EditUserDetails close={() => setEditUserOpen(false)} user={user} />
                )
            }
            {
                openSearchUser && (
                    <SearchUser close={() => setOpenSearchUser(false)} />
                )
            }

        </div>
    )
}

export default Sidebar