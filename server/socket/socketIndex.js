import express from "express";
import { Server } from "socket.io";
import http from "http";
import getUserDetailsFromToken from "../helper/getUserDetailsFromToken.js";
import UserModel from "../models/UserModel.js";
import { ConversationModel, MessageModel } from "../models/ConversationModel.js";
import getConversation from "../helper/getConversation.js";
import mongoose from "mongoose";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    },
});

// online user
const onlineUser = new Set()

io.on("connection", async (socket) => {
    console.log("New client connected", socket?.id);

    const token = socket?.handshake?.auth?.token
    // current user details
    const user = await getUserDetailsFromToken(token)

    // create a room
    socket.join(user?._id?.toString())

    onlineUser.add(user?._id?.toString())
    io.emit("onlineUser", Array.from(onlineUser))

    socket.on("message-page", async (userId) => {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error("Invalid userId in message-page:", userId);
            return; // Exit the event handler
        }
        const userDetails = await UserModel.findById(userId).select("-password")

        const payload = {
            _id: userDetails?._id,
            name: userDetails?.name,
            email: userDetails?.email,
            profile_pic: userDetails?.profile_pic,
            online: onlineUser?.has(userId)
        }

        socket.emit("message-user", payload)

        // Get Previous messages
        const getConversationMessage = await ConversationModel.findOne(
            {
                "$or": [
                    { sender: user?._id, receiver: userId },
                    { sender: userId, receiver: user?._id }
                ]
            }
        ).populate("messages").sort({ updatedAt: -1 })

        socket.emit("message", getConversationMessage?.messages || [])
    })

    // new message
    socket.on("new message", async (data) => {
        const { sender, receiver, text, imageUrl, videoUrl } = data

        // check conversation exists or not
        let conversation = await ConversationModel.findOne({
            "$or": [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender }
            ]
        })

        // if conversation not exists then create new conversation
        if (!conversation) {
            const createConversation = await ConversationModel.create({
                sender,
                receiver,
            })
            conversation = await createConversation.save()
        }

        const message = new MessageModel({
            text,
            imageUrl,
            videoUrl,
            msgByUserId: sender,
        });

        const saveMessage = await message.save();

        const updateConversation = await ConversationModel.updateOne(
            { _id: conversation?._id },
            {
                $push: {
                    messages: saveMessage?._id,
                },
            }
        )

        const getConversationMessage = await ConversationModel.findOne(
            {
                "$or": [
                    { sender: sender, receiver: receiver },
                    { sender: receiver, receiver: sender }
                ]
            }
        ).populate("messages").sort({ updatedAt: -1 })

        io.to(sender).emit("message", getConversationMessage?.messages || [])
        io.to(receiver).emit("message", getConversationMessage?.messages || [])

        // send conversation
        const senderConversation = await getConversation(sender)
        const receiverConversation = await getConversation(receiver)

        io.to(sender).emit("conversation", senderConversation)
        io.to(receiver).emit("conversation", receiverConversation)


    })

    // sidebar
    socket.on("sidebar", async (userId) => {
        console.log("Current userId", userId)

        const conversation = await getConversation(userId)
        socket.emit("conversation", conversation)


    })

    socket.on("seen", async (msgByUserId) => {
        if(!mongoose.Types.ObjectId.isValid(msgByUserId)){
            console.error("invalid msgByUserId", msgByUserId);
            return;
        }
        let conversation = await ConversationModel.findOne({
            "$or": [
                { sender: user?._id, receiver: msgByUserId },
                { sender: msgByUserId, receiver: user?._id }
            ]
        })

        const conversationMessageId = conversation?.messages || []
        const updateMessage = await MessageModel.updateMany(
            {
                _id: { $in: conversationMessageId },
                msgByUserId: msgByUserId
            },
            {
                $set: {
                    seen: true
                }
            }
        )
        // send conversation
        const senderConversation = await getConversation(user?._id?.toString())
        const receiverConversation = await getConversation(msgByUserId)

        io.to(user?._id?.toString()).emit("conversation", senderConversation)
        io.to(msgByUserId).emit("conversation", receiverConversation)

    }
    )

    // disconnect
    socket.on("disconnect", () => {
        onlineUser.delete(user?._id?.toString())
        console.log("Client disconnected", socket.id);
    });
});

export { app, server };
