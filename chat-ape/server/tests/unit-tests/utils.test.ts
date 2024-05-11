import {
  fileValidator,
  generateAccessRefreshTokens,
} from "../../src/utils/utils";

const database = {
  collection: jest.fn().mockImplementation(() => ({
    insertOne: jest.fn().mockResolvedValue(true),
  })),
};

describe("tests the functions in the utils directory", () => {
  it("tests the file validator", async () => {
    const isFile = fileValidator({
      filename: "testFile",
    } as Express.Multer.File);
    expect(isFile).toBe("testFile");
  });

  it("negative:1 tests the failure of file validator", () => {
    expect(() => fileValidator(undefined)).toThrow();
  });
});

describe("tests the  generateAccessRefreshTokens function", () => {
  it("should generate the access and refresh tokens ", async () => {
    const tokens = await generateAccessRefreshTokens(
      { id: "1122" },
      database as any,
    );
    expect(tokens).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    );
  });
});
