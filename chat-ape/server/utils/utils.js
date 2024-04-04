const jwt = require("jsonwebtoken")

// to generate the access token
async function generateAccessRefreshTokens(user, database) {
    try {
        const accessToken =  jwt.sign(user, process.env.ACCESS_SECRET);
        const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET)
        if(!accessToken || !refreshToken) throw new Error
        await database.collection("tokens").insertOne({ token : refreshToken})
        return { accessToken , refreshToken }
    } catch (error) {
        throw new Error("failed to generate the access and refresh tokens")
    }
}


module.exports = {
    generateAccessRefreshTokens,
}
