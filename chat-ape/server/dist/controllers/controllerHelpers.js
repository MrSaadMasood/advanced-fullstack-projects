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
            return false;
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
            yield session.commitTransaction();
            return true;
        }
        catch (error) {
            yield session.abortTransaction();
            return false;
        }
        finally {
            yield session.endSession();
        }
    });
}
// removes the friend from the friends array from both the user and the other friend
function removeFriendTransaction(client, userId, idToRemove) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = client.startSession();
        try {
            session.startTransaction();
            const database = client.db("chat-app");
            yield database.collection("users").updateOne({ _id: userId }, { $pull: { friends: idToRemove } }, transactionOptions);
            yield database.collection("users").updateOne({ _id: idToRemove }, { $pull: { friends: userId } }, transactionOptions);
            yield session.commitTransaction();
            return true;
        }
        catch (error) {
            console.log("transaction to remove the friend failed");
            yield session.abortTransaction();
            return false;
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
            yield database.collection("users").updateOne({ _id: userId }, { $pull: { receivedRequests: idToRemove } });
            yield database.collection("users").updateOne({ _id: idToRemove }, { $pull: { sentRequests: userId } });
            yield session.commitTransaction();
            return true;
        }
        catch (error) {
            console.log("error occured while removing the follow request");
            yield session.abortTransaction();
            return false;
        }
        finally {
            session.endSession();
        }
    });
}
// updates the normal chats array and adds the friend id and the "normalChats" collection document id in the array
function pushAddFriendChanges(database, userId, friendId, chatId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
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
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
// creates a new group and adds a messages to in the chat and then adds the id of the document in the "groupChats" collection
// to all the members in the members array
// if group image is not provided null is added in the field
function groupChatTransaction(client, userId, members, groupName, groupImage) {
    return __awaiter(this, void 0, void 0, function* () {
        const filename = groupImage ? groupImage : null;
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
                        groupImage: filename
                    }
                }
            });
            session.commitTransaction();
            return true;
        }
        catch (error) {
            session.abortTransaction();
            return false;
        }
        finally {
            session.endSession();
        }
    });
}
function updateNormalChatData(database, collectionId, senderId, contentType, content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const randomObjectId = randomUUID();
            yield database.collection("normalChats").updateOne({ _id: collectionId }, {
                $push: {
                    chat: {
                        userId: senderId,
                        [contentType]: content,
                        time: new Date(),
                        id: randomObjectId
                    }
                }
            });
            return randomObjectId;
        }
        catch (error) {
            throw new Error("failed to update the normal chat");
        }
    });
}
// gets used to get the friends and received requests based on type provided
function getCustomData(database, userId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield database.collection("users").findOne({ _id: userId });
            if (!user)
                throw new Error;
            const data = yield database.collection("users").find({
                _id: { $in: user[type] }
            }, {
                projection: {
                    fullName: 1,
                    profilePicture: 1
                }
            }).toArray();
            if (!data)
                throw new Error;
            return data;
        }
        catch (error) {
            console.log("cannot get the custom data");
            return;
        }
    });
}
// updates the groupChats document based on the content type provided either is it "path" for images or "content"/ normal message
function updateGroupChat(database, collectionId, userId, contentType, content) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
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
            if (!updated)
                throw new Error;
            return randomId;
        }
        catch (error) {
            return false;
        }
    });
}
// deletes the specific message based on the collection name
function deleteMessageFromChat(database, collectionId, messageId, collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const deletedMessage = yield database.collection(collectionName).updateOne({ _id: collectionId }, { $pull: {
                    chat: {
                        id: messageId
                    }
                }
            });
            if (!deletedMessage)
                throw new Error;
            return true;
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
function chatArraySizeFinder(database, collectionId, collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
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
        }
        catch (error) {
            console.log("failed to get the size of the chat Array");
            throw new Error;
        }
    });
}
function groupManager(database, operationType, arrayType, memberId, collectionId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const arrayToPerformOperation = `groupChats.$.${arrayType}`;
        try {
            console.log(operationType, arrayToPerformOperation, memberId, collectionId, userId);
            const updatedGroup = yield database.collection("users").updateOne({ _id: userId, "groupChats.collectionId": collectionId }, { [operationType]: {
                    [arrayToPerformOperation]: memberId
                } });
            console.log("the updated group is", updatedGroup);
            if (!updatedGroup.modifiedCount)
                throw new Error;
            return updatedGroup;
        }
        catch (error) {
            throw new Error;
        }
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
export { sendingRequestsTransaction, addFriendTransaction, removeFollowRequestTransaction, removeFriendTransaction, clientMaker, groupChatTransaction, getCustomData, updateGroupChat, deleteMessageFromChat, dataBaseConnectionMaker, chatArraySizeFinder, groupManager, updateNormalChatData };
