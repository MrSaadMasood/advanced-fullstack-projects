const express = require("express")
const { Server } = require("socket.io")
const http = require("http")
const cors = require("cors")
const helmet = require("helmet")
const cluster = require("node:cluster")
const os = require("os")
const { setupPrimary, createAdapter } = require("@socket.io/cluster-adapter")
const morgan = require("morgan")
const { serverLogger } = require("./logger/conf/loggerConfiguration.js")

const authIndex = require("./routes/index.js")
const userRouter = require("./routes/userRouter.js")
const factor2Router = require("./routes/factor2Auth.js")

const { connectData} = require("./connection.js")
const { authenticateUser, factor2RouteTokenAuthenticator } = require("./middlewares/middlewares.js")

require("dotenv").config()

const numCPUs = os.availableParallelism()
const PORT = process.env.PORT

morgan.token("authoken", (req, res)=>{
    return req.headers["authorization"]
})

if(cluster.isPrimary){
    
    for(let i = 0 ; i < numCPUs ; i++){
        cluster.fork()
    }

    setupPrimary()
}
else { 
    const app = express()
    const server = http.createServer(app)
    // creating a new server instance form the above server made with http. this server instance will be used for websockets
    const io = new Server(server , {
        cors : {
            origin : process.env.CROSS_ORIGIN
        },
        adapter : createAdapter()
    })

    app.use(helmet())
    app.use(morgan("dev"))
    app.use(cors({
        origin : process.env.CROSS_ORIGIN
    }))

    app.use(express.json())
    app.use(express.urlencoded({ extended : false}))
    app.use(express.static("uploads"))

    // if database connection is successfull then configuring the server to listen to the port
    // server.listen(PORT , ()=> console.log("the server is connected at port", PORT))
    connectData((err)=>{
        if(!err){
            server.listen(PORT , ()=> serverLogger.info("the server is running successfully"))
        }
        else {
            serverLogger.info("failed to start the server")
            serverLogger.error(err)
        }
    })

    app.use("/auth-user", authIndex )

    app.use("/factor2", factor2RouteTokenAuthenticator , factor2Router)

    app.use("/user", authenticateUser , userRouter)

    // the io instance of the server from the socket.io is used to listen for the connection event
    // if connected the socket object / instance will be given which will listen to customized events
    io.on("connection" , (socket)=>{

        socket.on("join-room", (oldRoomId, newRoomId)=>{

            if(oldRoomId){
                socket.leave(oldRoomId)
            }
            socket.join(newRoomId)
            socket.emit("joined-chat", newRoomId)
        })

        socket.on("send-message", (roomId, data, chatType, groupChatData)=>{
            socket.to(roomId).emit("received-message", data, chatType, groupChatData )
        })

        socket.on("delete-message", (roomId, messageId, type)=>{
            socket.to(roomId).emit("delete-message", messageId, type)
        })

    })

}
