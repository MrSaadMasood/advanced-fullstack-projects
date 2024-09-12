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
describe('tests the create new group functionlity', () => {
    it("should create a new Group", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield api.post("/user/create-new-group").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
            members: JSON.stringify(["100020747428319565071", "f06ec470-49b4-4f90-bb87-93b078eea9e9"]),
            groupName: "testGroup"
        });
        expect(result.status).toBe(200);
        expect(result.body).toEqual({ message: "the group is successfully created" });
    }));
    it("negative: should fail to crate a new group", () => __awaiter(void 0, void 0, void 0, function* () {
        const error = yield api.post("/user/create-new-group").set("Authorization", loggedInUserAccessToken)
            .type("form")
            .send({
            members: JSON.stringify(["f06ec470-49b4-4f90-bb87-93b078eea9e9"]),
            groupName: "testGroup"
        });
        expect(error.status).toBe(400);
    }));
});
