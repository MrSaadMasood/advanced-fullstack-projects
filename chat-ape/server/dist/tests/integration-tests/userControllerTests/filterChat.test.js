var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import api, { loggedInUserAccessToken } from "../../jest.setup";
describe('filters the chat based on input', () => {
    it("should filter based on the date only", () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date("4/19/2024");
        const response = yield api.post("/user/filter-chat").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
            date,
            chatType: "group",
            collectionId: "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("groupChatData");
        expect(response.body.groupChatData).toHaveLength(4);
    }));
    it("should filter based on date and member", () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date("4/19/2024");
        const response = yield api.post("/user/filter-chat").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
            date,
            chatType: "group",
            collectionId: "f7f29bde-6ffb-47f4-bdeb-2bd5019312cf",
            groupMemberId: "e2c9774d-9295-459c-8d9f-b06753458c94"
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("groupChatData");
        expect(response.body.groupChatData).toHaveLength(1);
    }));
    it("should filter the normal chats", () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date("4/19/2024");
        const response = yield api.post("/user/filter-chat").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
            date,
            chatType: "normal",
            collectionId: "bc8c0ee9-a591-4def-b1ac-192fdcba6027",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("chat");
        expect(response.body.chat).toHaveLength(3);
    }));
});
