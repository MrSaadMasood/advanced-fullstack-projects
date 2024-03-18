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
        console.log("failed while generating and storing the tokens")
        throw new Error 
    }
}


module.exports = {
    generateAccessRefreshTokens,
}
