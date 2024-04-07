var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { connectData, getData } from "../connection.js";
import { validationResult } from "express-validator";
import path from "path";
import fs from "fs";
import { sendingRequestsTransaction, clientMaker, addFriendTransaction, removeFollowRequestTransaction, removeFriendTransaction, groupChatTransaction, getCustomData, updateGroupChat, deleteMessageFromChat, chatArraySizeFinder, groupManager, updateNormalChatData } from "./controllerHelpers.js";
import { logger } from "../logger/conf/loggerConfiguration.js";
import { envValidator } from "../utils/utils.js";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const mongoUrl = process.env.MONGO_URL || "";
let database;
connectData((err) => {
    if (!err) {
        database = getData();
    }
});
// sends the userData to the client based on the user id
export const getUpdatedData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    try {
        const updatedData = yield database.collection("users").findOne({ _id: id }, { projection: { password: 0 } });
        if (!updatedData)
            throw new Error("failed to get the user data from the database");
        res.json(updatedData);
    }
    catch (error) {
        res.status(400).json({ error: "could not get the updated user" });
    }
});
// get the full name and id of all users from the database
export const getUsersData = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield database.collection("users").find({}, {
            projection: {
                fullName: 1,
                profilePicture: 1
            },
            sort: {
                fullName: 1,
            }
        })
            .toArray();
        if (!users)
            throw new Error("failed to get all users data");
        res.json(users);
    }
    catch (error) {
        res.status(400).json({ error: "error occured while getting users" });
    }
});
// adds the sender id to the receivers received requests array
export const sendFollowRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId } = req.body;
    const { id } = req.user;
    const client = clientMaker(mongoUrl);
    const result = yield sendingRequestsTransaction(client, id, receiverId);
    if (result) {
        logger.info("follow request successfully sent");
        res.json({ message: "request successfully sent" });
    }
    else {
        res.status(400).json({ error: "cannot sent the request" });
    }
});
// get the firends data from the database
export const getFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    try {
        const friends = yield database.collection("users").aggregate([
            {
                $match: {
                    _id: id,
                },
            },
            {
                $unwind: "$normalChats",
            },
            {
                $lookup: {
                    from: "users",
                    localField: "normalChats.friendId",
                    foreignField: "_id",
                    as: "friendsData",
                },
            },
            {
                $unwind: "$friendsData",
            },
            {
                $project: {
                    _id: 0,
                    fullName: "$friendsData.fullName",
                    profilePicture: "$friendsData.profilePicture",
                    collectionId: "$normalChats.collectionId",
                },
            },
        ]).toArray();
        res.json(friends);
    }
    catch (error) {
        res.status(400).json({ error: "failed to get friends" });
    }
});
// gets the follow request from the database
export const getFollowRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const receivedRequests = yield getCustomData(database, id, "receivedRequests");
    if (receivedRequests && receivedRequests.length > 0) {
        return res.json(receivedRequests);
    }
    else {
        return res.status(400).json({ error: "failed to get the follow requests" });
    }
});
// adds the friends to the user
export const addFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { friendId } = req.body;
    const client = clientMaker(mongoUrl);
    const result = yield addFriendTransaction(client, id, friendId);
    if (result) {
        res.json({ message: "friend successfully added" });
    }
    else {
        res.status(400).json({ error: "failed to add friend" });
    }
});
// removes the friend from the friends array
export const removeFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const friendId = req.params.id;
    const client = clientMaker(mongoUrl);
    const result = yield removeFriendTransaction(client, id, friendId);
    if (result) {
        res.json({ message: "successfully removed friend" });
    }
    else {
        res.status(400).json({ error: "failed to remove friend" });
    }
});
// remove the follow request if one does not want to add the friend
export const removeFollowRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idToRemove = req.params.id;
    const { id } = req.user;
    const client = clientMaker(mongoUrl);
    const result = yield removeFollowRequestTransaction(client, id, idToRemove);
    if (result) {
        res.json({ message: "successfully removed follow request" });
    }
    else {
        res.status(400).json({ error: "failed to remove follow request" });
    }
});
// validates the data sent and then adds the chat message to that friends chat collection
export const updateChatData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { content, collectionId } = req.body;
    const passed = validationResult(req);
    try {
        if (passed.isEmpty()) {
            const randomMessageId = yield updateNormalChatData(database, collectionId, id, "content", content);
            res.json({ id: randomMessageId });
        }
        else
            throw new Error("failed to update normal chat with text");
    }
    catch (error) {
        res.status(400).json({ error: "the form was not submitted correctly" });
    }
});
// the the chat data with the friend does not exist it throw and error and sends 400 http status
// if the chats exists it checks which friends id matches the friend id in normal chats and
// fetches the data from the "normalChats" collection
export const getChatData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const collectionId = req.params.id;
    const { docsSkipCount = 0 } = req.query;
    try {
        const chatArrayCountObject = yield chatArraySizeFinder(database, collectionId, "normalChats");
        if (chatArrayCountObject.size < 10) {
            logger.info("the chat array has less than 10 messages");
            const chatData = yield database.collection("normalChats").findOne({ _id: collectionId });
            return res.json(chatData);
        }
        if (parseInt(docsSkipCount) > chatArrayCountObject.size)
            return res.json({ _id: chatArrayCountObject._id, chat: [] });
        const chatData = yield database.collection("normalChats").aggregate([
            {
                $match: {
                    _id: chatArrayCountObject._id,
                },
            },
            {
                $unwind: "$chat",
            },
            // {
            //     $skip: chatArrayCountObject.size - parseInt(docsSkipCount),
            // },
            // {
            //     $limit: 10,
            // },
            {
                $project: {
                    _id: 0,
                    chat: "$chat",
                },
            },
            {
                $replaceRoot: {
                    newRoot: "$chat",
                },
            },
        ]).toArray();
        if (!chatData)
            throw new Error;
        return res.json({ _id: chatArrayCountObject._id, chat: chatData });
    }
    catch (error) {
        return res.status(400).json({ error: "failed to get the chat data" });
    }
});
// uses aggregation pipeline to get the friends name and their last messages sent
export const getChatList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    try {
        const chatList = yield database.collection("users").aggregate([
            {
                $match: {
                    _id: id,
                },
            },
            {
                $unwind: "$normalChats",
            },
            {
                $lookup: {
                    from: "users",
                    localField: "normalChats.friendId",
                    foreignField: "_id",
                    as: "friendsData",
                },
            },
            {
                $unwind: "$friendsData",
            },
            {
                $lookup: {
                    from: "normalChats",
                    localField: "normalChats.collectionId",
                    foreignField: "_id",
                    as: "messages",
                },
            },
            {
                $unwind: "$messages",
            },
            {
                $addFields: {
                    lastMessage: {
                        $last: "$messages.chat",
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    lastMessage: 1,
                    friendData: {
                        fullName: "$friendsData.fullName",
                        _id: "$friendsData._id",
                        profilePicture: "$friendsData.profilePicture",
                        collectionId: "$normalChats.collectionId",
                    },
                },
            },
        ]).toArray();
        if (!chatList)
            throw new Error("failed to get the chat list");
        logger.info("chat list successfully collected");
        res.json(chatList);
    }
    catch (error) {
        res.status(400).json({ error: "failed to get the chat list" });
    }
});
// saves the filename to the database. same as the add message transaction but here the path field is used instead of "content".
export const saveChatImagePath = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionId } = req.body;
    const { id } = req.user;
    const { filename: filePath } = req.file;
    try {
        const randomMessageId = yield updateNormalChatData(database, collectionId, id, "path", envValidator(filePath, "filename"));
        res.json({ id: randomMessageId, filename: filePath });
    }
    catch (error) {
        res.status(400).json({ error: "failed to add image" });
    }
});
// gets the image from the server static files and sends it
export const getChatImage = (req, res) => {
    const { name } = req.params;
    const filepath = path.join(__dirname, `../uploads/chat-images/${name}`);
    res.sendFile(filepath);
};
// updates the bio of the user
export const changeBio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { bio } = req.body;
    const result = validationResult(req);
    try {
        if (result.isEmpty()) {
            const user = yield database.collection("users").updateOne({ _id: id }, { $set: { bio: bio } });
            if (!user)
                throw new Error("failed to update the bio");
            res.json({ message: "the bio has been successfullly added" });
        }
        else
            throw new Error("bio input validation error");
    }
    catch (error) {
        res.status(400).json({ error: "bio update failed" });
    }
});
// adds the profile picture name to the users document
export const saveProfilePicturePath = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { filename } = req.file;
    try {
        const addingProfilePicture = yield database.collection("users").updateOne({ _id: id }, { $set: {
                profilePicture: filename
            }
        });
        if (!addingProfilePicture)
            throw new Error("failed to save the profile picture of the user");
        res.json({ message: "profile picture successfully added" });
    }
    catch (error) {
        res.status(400).json({ error: "cannot update the profile picture" });
    }
});
// gets the static profile picture to the user
export const getProfilePicture = (req, res) => {
    const { name } = req.params;
    const filepath = path.join(__dirname, `../uploads/profile-images/${name}`);
    res.sendFile(filepath);
};
// deletes the previous profile picture of the user
export const deletePrevProfilePicture = (req, res) => {
    const { name } = req.params;
    fs.unlink(`./uploads/profile-images/${name}`, (err) => {
        if (err) {
            return res.status(400).json({ error: "some error occured" });
        }
        return res.json({ message: "picture successully deleted" });
    });
};
// gets the data of all the friends.
export const getFriendsData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    try {
        const friendsData = yield database.collection("users").aggregate([
            {
                $match: {
                    _id: id,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "friends",
                    foreignField: "_id",
                    as: "data",
                },
            },
            {
                $unwind: "$data",
            },
            {
                $project: {
                    _id: "$data._id",
                    fullName: "$data.fullName",
                },
            },
        ]).toArray();
        if (!friendsData)
            throw new Error("failed to get the friends Data");
        res.json(friendsData);
    }
    catch (error) {
        res.status(400).json({ error: "could not get the friendds data" });
    }
});
// creates a new group form the given information
export const createNewForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = validationResult(req);
    try {
        if (result.isEmpty()) {
            const { members, groupName } = req.body;
            const { id } = req.user;
            const { filename } = req.file;
            const parsedMembers = JSON.parse(members);
            const allMembers = parsedMembers.concat(id);
            const client = clientMaker(mongoUrl);
            const result = yield groupChatTransaction(client, id, allMembers, groupName, envValidator(filename, "filename"));
            if (result) {
                res.json({ message: "the group is successfully created" });
            }
            else {
                throw new Error;
            }
        }
        else
            throw new Error;
    }
    catch (error) {
        res.status(400).json({ error: "failed to create a new group" });
    }
});
// gets the group names and the last message in the group and the username that sent the message
export const getGroupChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    try {
        const groupChats = yield database.collection("users").aggregate([
            {
                $match: {
                    _id: id
                }
            },
            { $unwind: "$groupChats" },
            {
                $lookup: {
                    from: "groupChats",
                    localField: "groupChats.collectionId",
                    foreignField: "_id",
                    as: "chats"
                }
            },
            { $addFields: {
                    chat: {
                        $arrayElemAt: ["$chats.chat", -1]
                    }
                }
            },
            {
                $addFields: {
                    lastMessage: {
                        $arrayElemAt: ["$chat", -1]
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "lastMessage.userId",
                    foreignField: "_id",
                    as: "senderDataArray"
                }
            },
            {
                $addFields: {
                    senderData: {
                        $arrayElemAt: ["$senderDataArray", -1]
                    }
                }
            },
            {
                $project: {
                    _id: "$groupChats.collectionId",
                    groupName: "$groupChats.groupName",
                    groupImage: "$groupChats.groupImage",
                    lastMessage: "$lastMessage",
                    senderName: "$senderData.fullName"
                }
            }
        ]).toArray();
        if (!groupChats)
            throw new Error;
        res.json(groupChats);
    }
    catch (error) {
        res.status(400).json({ error: "cannot get the group chats list" });
    }
});
// sends the group picture to the client
export const getGroupPicture = (req, res) => {
    const { name } = req.params;
    const filepath = path.join(__dirname, `../uploads/group-images/${name}`);
    res.sendFile(filepath);
};
export const getGroupMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionId } = req.body;
    const { id } = req.user;
    try {
        const members = yield database.collection("users").aggregate([
            {
                $match: {
                    _id: id,
                },
            },
            {
                $unwind: "$groupChats",
            },
            {
                $lookup: {
                    from: "users",
                    localField: "groupChats.members",
                    foreignField: "_id",
                    as: "members",
                },
            },
            {
                $unwind: "$members",
            },
            {
                $match: {
                    "groupChats.collectionId": collectionId,
                },
            },
            {
                $project: {
                    _id: "$members._id",
                    fullName: "$members.fullName",
                    profilePicture: "$members.profilePicture"
                },
            },
        ]).toArray();
        res.json(members);
    }
    catch (error) {
        res.status(400).json({ error: "failed to get the group members" });
    }
});
export const filterChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, chatType, groupMemberId, collectionId } = req.body;
    const result = validationResult(req);
    const dateString = new Date(date).toLocaleString(undefined, {
        year: "numeric",
        day: "2-digit",
        month: "2-digit"
    });
    try {
        if (result.isEmpty()) {
            if (chatType === "group") {
                const groupChatData = yield database.collection("groupChats").aggregate([
                    {
                        $match: {
                            _id: collectionId,
                        },
                    },
                    {
                        $unwind: "$chat",
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "chat.userId",
                            foreignField: "_id",
                            as: "friendData",
                        },
                    },
                    {
                        $unwind: "$friendData",
                    },
                    {
                        $project: {
                            _id: 1,
                            chat: "$chat",
                            senderName: "$friendData.fullName",
                            messageDate: {
                                $dateToString: {
                                    format: "%m/%d/%Y",
                                    date: "$chat.time",
                                },
                            },
                        },
                    },
                    {
                        $match: {
                            messageDate: dateString,
                            $or: [
                                { "chat.userId": groupMemberId },
                                { "chat.userId": { $exists: true } }
                            ]
                        },
                    },
                    {
                        $project: {
                            messageDate: 0,
                        },
                    },
                ]).toArray();
                if (!groupChatData)
                    throw new Error;
                logger.info("group chats have been filtered");
                return res.json({ groupChatData, chatType });
            }
            const chatData = yield database.collection("normalChats").aggregate([
                {
                    $match: {
                        _id: collectionId,
                    },
                },
                {
                    $unwind: "$chat",
                },
                {
                    $project: {
                        _id: 0,
                        chat: "$chat",
                        messageDate: {
                            $dateToString: {
                                format: "%m/%d/%Y",
                                date: "$chat.time",
                            },
                        },
                    },
                },
                {
                    $match: {
                        messageDate: dateString,
                    },
                },
                {
                    $project: {
                        messageDate: 0,
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: "$chat"
                    }
                }
            ]).toArray();
            if (!chatData)
                throw new Error;
            logger.info("the normal chats have been filtered");
            return res.json({ _id: collectionId, chat: chatData, chatType });
        }
        else
            throw new Error;
    }
    catch (error) {
        return res.status(400).json({ error: "failed to get the filtered chats" });
    }
});
// gets all the messages of a specific group chat
export const getGroupChatData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    const { docsSkipCount = 0 } = req.query;
    try {
        const chatArrayCountObject = yield chatArraySizeFinder(database, chatId, "groupChats");
        // if(chatArrayCountObject.size < 10) {
        // }
        if (parseInt(docsSkipCount) > chatArrayCountObject.size)
            return res.json([]);
        const groupChatData = yield database.collection("groupChats").aggregate([
            {
                $match: {
                    _id: chatId,
                },
            },
            {
                $unwind: "$chat",
            },
            {
                $lookup: {
                    from: "users",
                    localField: "chat.userId",
                    foreignField: "_id",
                    as: "senderData",
                },
            },
            {
                $addFields: {
                    sender: {
                        $arrayElemAt: ["$senderData", -1],
                    },
                },
            },
            // {
            //     $skip: chatArrayCountObject.size - parseInt(docsSkipCount),
            // },
            // {
            //     $limit: 10,
            // },
            {
                $project: {
                    _id: 1,
                    chat: "$chat",
                    senderName: "$sender.fullName",
                },
            },
        ]).toArray();
        if (!groupChatData)
            throw new Error;
        return res.json(groupChatData);
    }
    catch (error) {
        return res.status(400).json({ error: "failed to get the group chat data" });
    }
});
// saves the image name in the chat document
export const saveGroupChatImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { filename } = req.file;
    const { groupId } = req.body;
    const result = yield updateGroupChat(database, groupId, id, "path", envValidator(filename, "filename"));
    if (result) {
        res.json({ filename, id: result });
    }
    else {
        res.status(400).json({ error: "failed to update the group chat" });
    }
});
// updates the message send sent in the database
export const updateGroupChatData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId, content } = req.body;
    const { id } = req.user;
    const result = yield updateGroupChat(database, groupId, id, "content", content);
    if (result) {
        res.json({ id: result });
    }
    else {
        res.status(400).json({ error: "failed to update the group chat" });
    }
});
// depending upon the chat type the collection<DocumentInput>name is decided and the message is deleted from the database
export const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { collectionId, type, messageId } = req.query;
    const errors = validationResult(req);
    try {
        if (errors.isEmpty()) {
            const collectionName = type === "normal" ? "normalChats" : "groupChats";
            yield deleteMessageFromChat(database, collectionId, messageId, collectionName);
        }
        else
            throw new Error("delete message input validation failed");
    }
    catch (error) {
        res.status(400).json({ error: "failed to delete the message" });
    }
});
export const makeMemberAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { memberId, collectionId } = req.body;
    const { id } = req.user;
    const result = validationResult(req);
    try {
        if (result.isEmpty()) {
            yield groupManager(database, "$push", "admins", memberId, collectionId, id);
            res.json({ message: "successfully made admin" });
        }
        else
            throw new Error;
    }
    catch (error) {
        res.status(400).json({ error: "failed to make the member an admin" });
    }
});
export const removeGroupAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { memberId, collectionId } = req.query;
    const { id } = req.user;
    const error = validationResult(req);
    try {
        if (error.isEmpty()) {
            yield groupManager(database, "$pull", "admins", memberId, collectionId, id);
            res.json({ message: "the admin has been successfullly removed" });
        }
        else
            throw new Error("failed to remove the group admin");
    }
    catch (error) {
        res.status(400).json({ error: "failed to remove admin" });
    }
});
export const removeMemberFromGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { memberId, collectionId } = req.query;
    const { id } = req.user;
    const errors = validationResult(req);
    try {
        if (errors.isEmpty()) {
            yield groupManager(database, "$pull", "members", memberId, collectionId, id);
            res.json({ message: "member successfullly removed" });
        }
        else
            throw new Error("failed to remove the member from group");
    }
    catch (error) {
        res.status(400).json({ error: "failed to remove the member from group" });
    }
});
export const addFriendToGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { friendId, collectionId } = req.body;
    const { id } = req.user;
    const errors = validationResult(req);
    try {
        if (errors.isEmpty()) {
            yield groupManager(database, "$push", "members", friendId, collectionId, id);
            res.json({ message: "friend successfulllye added to group" });
        }
        else
            throw new Error("failed to add friend to group");
    }
    catch (error) {
        res.status(400).json({ error: "failed to add friend to group" });
    }
});
