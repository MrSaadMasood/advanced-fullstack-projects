var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";
import { BadRequest } from "../ErrorHandler/customError.js";
import { generalErrorMessage, generalInputValidationError } from "../utils/utils.js";
import { validationResult } from "express-validator";
const transactionOptions = {
    writeConcern: { w: "majority" },
};
// a tranasaction where the senders sent requests array and the receivers receive request array are updated in an atomic way
function sendingRequestsTransaction(client, senderId, receiverId) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = client.startSession();
        try {
            session.startTransaction();
            const database = client.db("chat-app");
            yield database.collection("users").updateOne({ _id: senderId }, {
                $push: { sentRequests: receiverId }
            }, transactionOptions);
            yield database.collection("users").updateOne({ _id: receiverId }, {
                $push: { receivedRequests: senderId }
            }, transactionOptions);
            yield session.commitTransaction();
            return true;
        }
        catch (error) {
            yield session.abortTransaction();
            throw new BadRequest(generalErrorMessage("failed to send the follow requests"));
        }
        finally {
            yield session.endSession();
        }
    });
}
// it adds the friend id to the users friends array and removes the friend id from the recerived requests array
// removes the id from sent request of the friend and adds the user id to the friends array
function addFriendTransaction(client, acceptorId, friendId) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = client.startSession();
        const normalChatsCollectonId = randomUUID();
        try {
            session.startTransaction();
            const database = client.db("chat-app");
            yield pushAddFriendChanges(database, acceptorId, friendId, normalChatsCollectonId);
            yield pushAddFriendChanges(database, friendId, acceptorId, normalChatsCollectonId);
            yield database.collection("normalChats").insertOne({ _id: normalChatsCollectonId, chat: [{
                        userId: randomUUID(),
                        time: new Date(),
                        content: "You are now friends",
                        id: randomUUID()
                    }]
            });
            const friendData = yield database.collection("users").findOne({ _id: friendId }, { projection: {
                    fullName: 1,
                    profilePicture: 1,
                    collectionId: normalChatsCollectonId
                } });
            if (!friendData)
                throw new Error;
            yield session.commitTransaction();
            return friendData;
        }
        catch (error) {
            yield session.abortTransaction();
            throw new BadRequest(generalErrorMessage("failed to add friend"));
        }
        finally {
            yield session.endSession();
        }
    });
}
// removes the friend from the friends array from both the user and the other friend
function removeFriendTransaction(client, userId, idToRemove, collectionId) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = client.startSession();
        try {
            session.startTransaction();
            const database = client.db("chat-app");
            const modifiedUser = yield database.collection("users").updateOne({ _id: userId }, { $pull: { friends: idToRemove, normalChats: { friendId: idToRemove } } }, transactionOptions);
            const modifiedFriend = yield database.collection("users").updateOne({ _id: idToRemove }, { $pull: { friends: userId, normalChats: { friendId: userId } } }, transactionOptions);
            const deletedDocument = yield database.collection("normalChats").deleteOne({ _id: collectionId });
            if (!deletedDocument.deletedCount || !modifiedFriend.modifiedCount || !modifiedUser.modifiedCount)
                throw new Error;
            yield session.commitTransaction();
            return true;
        }
        catch (error) {
            yield session.abortTransaction();
            throw new BadRequest(generalErrorMessage("failed to remove friend"));
        }
        finally {
            yield session.endSession();
        }
    });
}
// removes the users id from the sent requests and the sender ids from the received requests array
function removeFollowRequestTransaction(client, userId, idToRemove) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = client.startSession();
        try {
            session.startTransaction();
            const database = client.db("chat-app");
            const updateAppUser = yield database.collection("users").updateOne({ _id: userId }, { $pull: { receivedRequests: idToRemove } });
            const updatedRequestSender = yield database.collection("users").updateOne({ _id: idToRemove }, { $pull: { sentRequests: userId } });
            if (!updateAppUser.modifiedCount || !updatedRequestSender.modifiedCount)
                throw new Error;
            yield session.commitTransaction();
            return true;
        }
        catch (error) {
            yield session.abortTransaction();
            throw new BadRequest(generalErrorMessage("failed to remove friend"));
        }
        finally {
            yield session.endSession();
        }
    });
}
// updates the normal chats array and adds the friend id and the "normalChats" collection document id in the array
function pushAddFriendChanges(database, userId, friendId, chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield database.collection("users").updateOne({ _id: userId }, {
            $push: {
                friends: friendId,
                normalChats: {
                    friendId: friendId,
                    collectionId: chatId
                }
            },
            $pull: { receivedRequests: friendId }
        }, transactionOptions);
    });
}
// creates a new group and adds a messages to in the chat and then adds the id of the document in the "groupChats" collection
// to all the members in the members array
// if group image is not provided null is added in the field
function groupChatTransaction(client, userId, members, groupName, groupImage) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = client.startSession();
        try {
            session.startTransaction();
            const database = client.db("chat-app");
            const randomId = randomUUID();
            yield database.collection("groupChats").insertOne({ _id: randomId,
                chat: [
                    {
                        id: randomUUID(),
                        userId: userId,
                        time: new Date(),
                        content: "You have been added in the group."
                    }
                ]
            });
            yield database.collection("users").updateMany({ _id: { $in: members } }, {
                $push: {
                    groupChats: {
                        id: randomUUID(),
                        members: members,
                        admins: [
                            userId
                        ],
                        collectionId: randomId,
                        groupName: groupName,
                        groupImage: groupImage || null
                    }
                }
            });
            yield session.commitTransaction();
            return true;
        }
        catch (error) {
            yield session.abortTransaction();
            throw new BadRequest(generalErrorMessage("failed to create a new group"));
        }
        finally {
            yield session.endSession();
        }
    });
}
function updateNormalChatData(database, collectionId, senderId, contentType, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const randomObjectId = randomUUID();
        const updateNormalChatData = yield database.collection("normalChats").updateOne({ _id: collectionId }, {
            $push: {
                chat: {
                    userId: senderId,
                    [contentType]: content,
                    time: new Date(),
                    id: randomObjectId
                }
            }
        });
        if (!updateNormalChatData.modifiedCount)
            throw new BadRequest(generalErrorMessage("failed to update the normal chat"));
        return randomObjectId;
    });
}
// gets used to get the friends and received requests based on type provided
function getCustomData(database, userId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const userFromDatabase = yield database.collection("users").findOne({ _id: userId });
        if (!userFromDatabase)
            throw new BadRequest(generalErrorMessage("failed to get the user data from database"));
        const data = yield database.collection("users").find({
            _id: { $in: userFromDatabase[type] }
        }, {
            projection: {
                fullName: 1,
                profilePicture: 1
            }
        }).toArray();
        return data;
    });
}
// updates the groupChats document based on the content type provided either is it "path" for images or "content"/ normal message
function updateGroupChat(database, collectionId, userId, contentType, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const randomId = randomUUID();
        const updated = yield database.collection("groupChats").updateOne({
            _id: collectionId
        }, { $push: {
                chat: {
                    [contentType]: content,
                    id: randomId,
                    userId: userId,
                    time: new Date()
                }
            } });
        if (!updated.modifiedCount)
            throw new BadRequest(generalErrorMessage("failed to add message to the group"));
        return randomId;
    });
}
// deletes the specific message based on the collection name
function deleteMessageFromChat(database, collectionId, messageId, collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        const deletedMessage = yield database.collection(collectionName).updateOne({ _id: collectionId }, { $pull: {
                chat: {
                    id: messageId
                }
            }
        });
        if (!deletedMessage.modifiedCount)
            throw new Error;
        return true;
    });
}
function chatArraySizeFinder(database, collectionId, collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatArrayCount = yield database.collection(collectionName).aggregate([
            {
                $match: {
                    _id: collectionId,
                },
            },
            {
                $project: {
                    size: {
                        $size: "$chat",
                    },
                },
            },
        ]).toArray();
        if (!chatArrayCount)
            throw new Error;
        return chatArrayCount[0];
    });
}
function groupManager(database, operationType, arrayType, memberId, collectionId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const arrayToPerformOperation = `groupChats.$.${arrayType}`;
        const updatedGroup = yield database.collection("users").updateOne({ _id: userId, "groupChats.collectionId": collectionId }, { [operationType]: {
                [arrayToPerformOperation]: memberId
            } });
        if (!updatedGroup.modifiedCount)
            throw new Error;
        return updatedGroup;
    });
}
function clientMaker(url) {
    return new MongoClient(url);
}
function dataBaseConnectionMaker(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new MongoClient(url);
        yield client.connect();
        const database = client.db("chat-app");
        return database;
    });
}
function incomingDataValidationHandler(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        throw new BadRequest(generalInputValidationError);
}
export { sendingRequestsTransaction, addFriendTransaction, removeFollowRequestTransaction, removeFriendTransaction, clientMaker, groupChatTransaction, getCustomData, updateGroupChat, deleteMessageFromChat, dataBaseConnectionMaker, chatArraySizeFinder, groupManager, updateNormalChatData, incomingDataValidationHandler };
