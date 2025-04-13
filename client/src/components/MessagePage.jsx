import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom'
import Avatar from './Avatar';
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaImage, FaPlus, FaVideo } from "react-icons/fa";
import Divider from './Divider';
import uploadFile from '../helpers/UploadFile';
import { IoClose } from "react-icons/io5";
import backgroundImage from "../assets/wallapaper.jpeg"
import { IoMdSend } from "react-icons/io";
import moment from "moment"
import toast from 'react-hot-toast';

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector((state) => state?.user?.socketConnection)
  const user = useSelector((state) => state?.user)
  const [dataUser, setDataUser] = useState({
    _id: "",
    name: "",
    email: "",
    profile_pic: "",
    online: false
  })
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false)
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  })
  const [uploadImgLoading, setUploadImgLoading] = useState(false)
  const [uploadVdoLoading, setUploadVdoLoading] = useState(false)
  const [allMessages, setAllMessages] = useState([])
  const currentMessage = useRef()

  const navigate = useNavigate();

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }

  }, [allMessages])

  // handle upload image 
  const handleUploadImage = async (e) => {
    setUploadImgLoading(true)
    const file = e.target.files[0];
    const uploadPhoto = await uploadFile(file)
    setOpenImageVideoUpload(false)
    setUploadImgLoading(false)
    setMessage(prev => ({
      ...prev,
      imageUrl: uploadPhoto?.url
    }))
  }

  // handle upload video
  const handleUploadVideo = async (e) => {
    setUploadVdoLoading(true)
    const file = e.target.files[0];
    const uploadVideo = await uploadFile(file)
    setOpenImageVideoUpload(false)
    setUploadVdoLoading(false)
    setMessage(prev => ({
      ...prev,
      videoUrl: uploadVideo?.url
    }))

  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        socketConnection.emit("new message", {
          sender: user?._id,
          receiver: params?.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id

        })
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: ""
        })
      }
    }


  }

  useEffect(() => {
    if (params?.userId) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${params.userId}/validate`)
        .then((response) => {
          if (!response.ok) {
            toast.error('Invalid user ID');
            navigate('/'); // Navigate to home if invalid
          }
        })
        .catch((error) => {
          console.error('User validation error:', error);
          toast.error('Failed to validate user');
          navigate('/'); // Navigate to home on fetch error
        });
    }
  }, [params.userId, navigate]);

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", params?.userId)

      socketConnection.emit("seen", params?.userId)

      socketConnection.on("message-user", (data) => {
        setDataUser(data)
      })
      socketConnection.on("message", (data) => {
        console.log("message_data", data)
        setAllMessages(data)
      })



    }
  }, [socketConnection, params?.userId, user])

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className='bg-no-repeat bg-cover'>
      <header className='border-l sticky px-4 top-0 h-16 bg-white flex items-center justify-between'>
        <div className="flex gap-4 items-center">

          <Link to={"/"} className='lg:hidden'>
            <FaAngleLeft size={25} className='cursor-pointer hover:text-primary' />
          </Link>

          <div className="">
            <Avatar
              userId={dataUser?._id}
              name={dataUser?.name}
              imageUrl={dataUser?.profile_pic}
              width={50}
              height={50}
              className=""
            />
          </div>

          <div className="">
            <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>
            <p className='-my-2 text-sm'>{dataUser.online ? <span className='text-primary'>online</span> : <span className='text-slate-500'>offline</span>}</p>
          </div>

        </div>
        <button className=' cursor-pointer hover:text-primary'>
          <HiDotsVertical size={20} />
        </button>
      </header>

      {/* Show All messages */}
      <section className='relative h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar bg-slate-200 bg-opacity-50'>

        {/* All Message show here */}
        <div ref={currentMessage} className="flex flex-col gap-2 p-2">
          {
            allMessages.map((message, index) => {
              return (
                <div
                  key={index + "messages"}
                  className={`max-w-60 min-w-14 lg:max-w-80 h-auto p-1 py-1 rounded w-fit ${user?._id === message?.msgByUserId ? "ml-auto bg-purple-200" : "mr-auto bg-cyan-100"} items-center`}>
                  <div className="w-full">
                    {
                      message?.imageUrl && (
                        <img src={message.imageUrl} alt="image"
                          className='w-full h-full object-scale-down'
                        />
                      )
                    }
                    {
                      message?.videoUrl && (
                        <video src={message.videoUrl} controls
                          className='w-full h-full object-scale-down'
                        />
                      )
                    }
                  </div>
                  <p className='px-2'>{message?.text}</p>
                  <p className='text-xs ml-auto w-fit '>{moment(message.createdAt).format("hh:mm")}</p>
                </div>
              )
            })
          }
        </div>

        {/* upload image display */}
        {
          uploadImgLoading && (
            <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex items-center justify-center rounded overflow-hidden">
              <div className="bg-white p-2 rounded">
                <div className="w-4 h-4 border-2 border-t-2 border-t-transparent rounded-full animate-spin border-primary"></div>
              </div>
            </div>
          )
        }
        {
          message.imageUrl && (
            <div className="w-full h-full sticky bottom-0  bg-slate-700 bg-opacity-30 flex items-center justify-center rounded overflow-hidden">
              <div className="w-fit p-2 absolute top-0 right-0 hover:text-red-600">
                <IoClose size={25} className=' cursor-pointer' onClick={() => setMessage(prev => ({ ...prev, imageUrl: "" }))} />
              </div>
              <div className="bg-white p-2 rounded">
                <img
                  src={message?.imageUrl}
                  alt="uploadImage"
                  className='h-full w-full aspect-square max-w-sm object-scale-down'
                />
              </div>
            </div>
          )
        }

        {/* upload Video display */}
        {
          uploadVdoLoading && (
            <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex items-center justify-center rounded overflow-hidden">
              <div className="bg-white p-2 rounded">
                <div className="w-4 h-4 border-2 border-t-2 border-t-transparent rounded-full animate-spin border-primary"></div>
              </div>
            </div>
          )
        }
        {
          message.videoUrl && (
            <div className="w-full sticky bottom-0 h-full bg-slate-700 bg-opacity-30 flex items-center justify-center rounded overflow-hidden">
              <div className="w-fit p-2 absolute top-0 right-0 hover:text-red-600">
                <IoClose size={25} className=' cursor-pointer' onClick={() => setMessage(prev => ({ ...prev, videoUrl: "" }))} />
              </div>
              <div className="bg-white p-2 rounded">
                <video
                  src={message?.videoUrl}
                  className='h-full w-full aspect-video max-w-sm m-2'
                  controls
                  autoPlay
                />
              </div>
            </div>
          )
        }
      </section>



      {/* Send messages */}
      <section className='h-16 bg-white flex items-center px-4'>
        <div className=" relative">
          <button onClick={() => setOpenImageVideoUpload(prev => !prev)} className='flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white'>
            <FaPlus size={20} className='cursor-pointer' />
          </button>

          {/* vdo and img */}
          {
            openImageVideoUpload && (
              <div className="bg-white shadow rounded absolute bottom-14 w-36 p-2">
                <form className='flex flex-col'>
                  <label htmlFor='uploadImage' className='flex gap-3 p-1 px-2 items-center cursor-pointer hover:bg-slate-200 rounded'>
                    <div className=" text-primary">
                      <FaImage size={18} />
                    </div>
                    {
                      uploadImgLoading ? <div className="w-4 h-4 border-2 border-t-2 border-t-transparent rounded-full animate-spin border-primary"></div> : <p>Image</p>
                    }
                  </label>

                  <Divider />

                  <label htmlFor='uploadVideo' className='flex gap-3 p-1 px-2 items-center cursor-pointer hover:bg-slate-200 rounded'>
                    <div className="text-purple-500">
                      <FaVideo size={18} />
                    </div>
                    {
                      uploadVdoLoading ? <div className="w-4 h-4 border-2 border-t-2 border-t-transparent rounded-full animate-spin border-primary"></div> : <p>Video</p>
                    }
                  </label>

                  <input
                    type="file"
                    id='uploadImage'
                    className='hidden'
                    accept='image/*'
                    onChange={handleUploadImage}
                  />
                  <input
                    type="file"
                    id='uploadVideo'
                    className='hidden'
                    accept='video/*'
                    onChange={handleUploadVideo}
                  />

                </form>
              </div>

            )
          }


        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="h-full w-full flex items-center gap-2">
          <input
            type="text"
            placeholder='Type here message...'
            className='py-1 px-4 outline-none w-full h-full'
            value={message?.text}
            onChange={(e) => setMessage(prev => ({ ...prev, text: e.target.value }))}
          />

          {
            message?.text || message?.imageUrl || message?.videoUrl ? (
              <button type='submit' className='flex justify-center items-center w-11 h-11 rounded-full bg-primary text-white hover:bg-opacity-90'>
                <IoMdSend size={20} className='cursor-pointer' />
              </button>
            ) : (
              <button type='submit' disabled className='flex justify-center items-center w-11 h-11 rounded-full bg-slate-300 text-slate-500 cursor-not-allowed'>
                <IoMdSend size={20} className='cursor-not-allowed' />
              </button>
            )
          }

        </form>


      </section>

    </div>
  )
}

export default MessagePage