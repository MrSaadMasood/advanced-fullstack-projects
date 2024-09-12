var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { addFriendTransaction, chatArraySizeFinder, clientMaker, deleteMessageFromChat, getCustomData, groupChatTransaction, groupManager, removeFollowRequestTransaction, removeFriendTransaction, sendingRequestsTransaction, updateGroupChat, updateNormalChatData } from "../../src/controllers/controllerHelper";
import { BadRequest } from "../../src/ErrorHandler/customError";
const client = (promiseResult) => ({
    startSession: jest.fn(() => ({
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(() => Promise.resolve()),
        abortTransaction: jest.fn(() => Promise.resolve()),
        endSession: jest.fn(() => Promise.resolve())
    })),
    db: jest.fn().mockImplementation(() => {
        if (promiseResult)
            return {
                collection: jest.fn().mockImplementation(() => ({
                    updateOne: jest.fn(() => Promise.resolve({ modifiedCount: 1 })),
                    insertOne: jest.fn(() => Promise.resolve({ insertedCount: 1 })),
                    findOne: jest.fn(() => Promise.resolve({ fullName: "testFriend" })),
                    updateMany: jest.fn(() => Promise.resolve()),
                    deleteOne: jest.fn(() => Promise.resolve({ deletedCount: 1 })),
                    find: jest.fn(() => ({
                        toArray: jest.fn(() => Promise.resolve([{ value: "random" }]))
                    })),
                    aggregate: jest.fn(() => ({
                        toArray: jest.fn(() => Promise.resolve([{ value: "random" }]))
                    }))
                }))
            };
        return {
            collection: jest.fn().mockImplementation(() => ({
                updateOne: jest.fn(() => Promise.resolve({ modifiedCount: 0 })),
                insertOne: jest.fn(() => Promise.reject({ insertedCount: 1 })),
                findOne: jest.fn(() => Promise.reject([])),
                updateMany: jest.fn(() => Promise.reject()),
                deleteOne: jest.fn(() => Promise.resolve({ deletedCount: 0 })),
                find: jest.fn(() => ({
                    toArray: jest.fn(() => Promise.reject([{ value: "random" }]))
                })),
                aggregate: jest.fn(() => ({
                    toArray: jest.fn(() => Promise.reject([{ value: "random" }]))
                }))
            }))
        };
    })
});
describe('tests the sendingRequestsTransaction', () => {
    it('should successfully send the request to the user', () => {
        expect(() => sendingRequestsTransaction(client(true), "sender", "receiver")).resolves;
    });
    it("negative: should fail to send the requuest", () => {
        expect(() => sendingRequestsTransaction(client(false), "sender", "receiver")).rejects;
    });
});
describe('tests the addFriendTransaction', () => {
    it('should successfull add the user as a friend', () => __awaiter(void 0, void 0, void 0, function* () {
        const friendData = yield addFriendTransaction(client(true), "acceptorId", "friendId");
        expect(friendData).toHaveProperty("fullName", "testFriend");
    }));
    it("negative: should fail to add friend", () => {
        expect(() => addFriendTransaction(client(false), "acceptorId", "friendId")).rejects;
    });
});
describe('tests the removeFriendTransaction', () => {
    it('should remove the friend of the users', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield removeFriendTransaction(client(true), "user", "friendtoRemove", "collection");
        expect(result).toBe(true);
    }));
    it('negative : should fail to remove the friend of the user', () => {
        expect(() => removeFriendTransaction(client(false), "user", "friendtoRemove", "collection")).rejects;
    });
});
describe('tests the removeFollowRequestTransaction', () => {
    it('should remove the follow request sent to the user', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield removeFollowRequestTransaction(client(true), "user", "friendtoRemove");
        expect(result).toBe(true);
    }));
    it('negative : should fail to remove the request of the user', () => {
        expect(() => removeFriendTransaction(client(false), "user", "friendtoRemove", "collection")).rejects;
    });
});
describe('tests the groupChatTransaction', () => {
    const members = ["member1", "member2"];
    it('should create a new group and add creation message to the group', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield groupChatTransaction(client(true), "user", members, "testGroup");
        expect(result).toBe(true);
        const anotherResult = yield groupChatTransaction(client(true), "user", members, "testGroup", "testImage");
        expect(anotherResult).toBe(true);
    }));
    it('negative : should fail to create a new group', () => {
        expect(() => groupChatTransaction(client(false), "user", members, "testGroup", "testImage"))
            .rejects.toThrow(BadRequest);
    });
});
describe('tests the updateNormalChatData', () => {
    it('should update the normalChats collection with the sent message', () => __awaiter(void 0, void 0, void 0, function* () {
        const database = client(true).db();
        const result = yield updateNormalChatData(database, "collection", "sender", "normal", "content");
        expect(result).toEqual(expect.any(String));
    }));
    it('negative : should fail to update the normal chats collection', () => {
        const database = client(false).db();
        expect(() => updateNormalChatData(database, "collection", "sender", "normal", "content"))
            .rejects.toThrow();
    });
});
describe('should get the custom data like friends , sent Requests , follow Requests from the user', () => {
    it('should get the custom data form the user', () => __awaiter(void 0, void 0, void 0, function* () {
        const database = client(true).db();
        const data = yield getCustomData(database, "user", "friends");
        expect(data).toHaveLength(1);
        expect(data).toEqual(expect.any(Object));
    }));
    it("negative: should fail to get the custom data", () => {
        const database = client(false).db();
        expect(() => getCustomData(database, "user", "friends")).rejects;
    });
});
describe('should update the group chat data', () => {
    it('should successfully update the group chat', () => __awaiter(void 0, void 0, void 0, function* () {
        const database = client(true).db();
        const updatedId = yield updateGroupChat(database, "collection", "user", "normal", "content");
        expect(updatedId).toEqual(expect.any(String));
    }));
    it('negative : should fail to update the group chat', () => {
        const database = client(false).db();
        expect(() => updateGroupChat(database, "collection", "user", "normal", "content")).rejects.toThrow();
    });
});
describe('test the message deletion from the chat', () => {
    it('should successfully delete the message from chat', () => __awaiter(void 0, void 0, void 0, function* () {
        const database = client(true).db();
        const isDeleted = yield deleteMessageFromChat(database, "collectionid", "messageid", "testCollection");
        expect(isDeleted).toBe(true);
    }));
    it('negative : fail to delete the messagee from chat', () => {
        const database = client(false).db();
        expect(() => deleteMessageFromChat(database, "collectionid", "messageid", "testCollection")).rejects.toThrow();
    });
});
describe('test the chat message array size', () => {
    it('should successullly find the size of the chat array', () => __awaiter(void 0, void 0, void 0, function* () {
        const database = client(true).db();
        const size = yield chatArraySizeFinder(database, "collectionid", "testCollection");
        expect(size).toEqual(expect.objectContaining({ value: "random" }));
    }));
    it('should fail to find the size of the chat array', () => {
        const database = client(false).db();
        expect(() => chatArraySizeFinder(database, "collectionid", "testCollection")).rejects;
    });
});
describe('test the groupManager function', () => {
    it('should perform the operation assigned to the group manager', () => __awaiter(void 0, void 0, void 0, function* () {
        const database = client(true).db();
        const updatedGroup = yield groupManager(database, "$pull", "admins", "memberId", "collectionid", "user");
        expect(updatedGroup).toBeTruthy();
    }));
    it("negative: should to perform the operation on the group", () => {
        const database = client(false).db();
        expect(() => groupManager(database, "$pull", "admins", "memberId", "collectionid", "user")).rejects.toThrow();
    });
});
describe('tests the clientMaker', () => {
    it("should return the client", () => {
        const client = clientMaker("mongodb://randomUrl");
        expect(client).toBeTruthy();
        expect(client).toEqual(expect.any(Object));
    });
});
