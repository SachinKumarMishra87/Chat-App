import React, { useEffect, useRef, useState } from 'react'
import { FiDelete } from "react-icons/fi";
import uploadFile from '../helpers/UploadFile';
import Divider from './Divider';
import axios from 'axios';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Avatar from './Avatar';
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from '../redux/userSlice';

const EditUserDetails = ({ close, user }) => {
    const dispatch = useDispatch();

    const [data, setData] = useState({
        name: "",
        profile_pic: ""
    });

    const [imgLoading, setImgLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const uploadPhotoRef = useRef();

    useEffect(() => {
        if (user) {
            setData({
                name: user.name || "",
                profile_pic: user.profile_pic || ""
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUploadPhoto = async (e) => {
        setImgLoading(true);
        const file = e.target.files[0];
        const uploadPhoto = await uploadFile(file);
        setData((prev) => ({
            ...prev,
            profile_pic: uploadPhoto?.url
        }));
        setImgLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setSubmitLoading(true);

            const safeData = {
                name: data.name,
                profile_pic: data.profile_pic
            };

            const URL = `${import.meta.env.VITE_BACKEND_URL}/api/update-userDetails`;

            const response = await axios.post(URL, safeData, {
                withCredentials: true
            });

            const { data: responseData } = response;

            if (responseData.success) {
                toast.success(responseData?.message);
                dispatch(setUser(responseData?.data));
                close();
            }

        } catch (error) {
            console.log("error", error);
            toast.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleOpenUploadPhoto = (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadPhotoRef.current.click();
    };

    return (
        <section className='fixed top-0 left-0 w-full h-full bg-neutral-900 bg-opacity-70 z-50 flex items-center justify-center'>
            <div className="bg-white p-4 m-1 rounded w-full max-w-sm shadow-lg ">
                <div className="flex justify-between w-full">
                    <div>
                        <h2 className='font-semibold'>Profile Details</h2>
                        <p className='text-sm'>Edit user details</p>
                    </div>
                    <div className='text-red-950 hover:text-red-700 cursor-pointer' onClick={close}>
                        <FiDelete size={25} />
                    </div>
                </div>

                <div className="mt-2 flex justify-center items-center overflow-hidden mx-auto">
                    <Avatar
                        width={100}
                        height={100}
                        imageUrl={data?.profile_pic}
                        name={data?.name}
                    />
                </div>

                <form onSubmit={handleSubmit} className='flex flex-col gap-2 mt-1'>
                    <div>
                        <label className='text-slate-800 ml-0.5' htmlFor="name">Name:</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={data.name}
                            onChange={handleChange}
                            className='w-full p-2 mt-0.5 border-2 border-slate-300 rounded focus:outline-none focus:border-blue-700'
                        />
                    </div>

                    <div>
                        <div className='my-1 flex items-center gap-4 bg-gray-300 py-2 px- rounded'>
                            <label htmlFor='profile_pic' className='flex w-full flex-col justify-center items-center cursor-pointer'>
                                <input
                                    type='file'
                                    id='profile_pic'
                                    className='hidden'
                                    onChange={handleUploadPhoto}
                                    ref={uploadPhotoRef}
                                />
                                <button className='font-semibold' onClick={handleOpenUploadPhoto}>
                                    {
                                        imgLoading ? (
                                            <AiOutlineLoading3Quarters className='animate-spin text-lg mx-auto' />
                                        ) : "Change Photo"
                                    }
                                </button>
                            </label>
                        </div>
                    </div>

                    <Divider />

                    <div className="w-full flex justify-between">
                        <button
                            onClick={close}
                            type="button"
                            className="w-24 py-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold border border-red-900 rounded shadow-md shadow-red-800 transition-all duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-24 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold border border-green-900 rounded shadow-md shadow-green-800 transition-all duration-300"
                        >
                            {
                                submitLoading ? (
                                    <AiOutlineLoading3Quarters className='animate-spin text-lg mx-auto' />
                                ) : "Save"
                            }
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default EditUserDetails;
