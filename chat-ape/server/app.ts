import { Socket} from "socket.io"
import "express-async-errors"
import express from "express"
import compression from 'compression' 
import { Server } from "socket.io"
import http from "http"
import cors from "cors"
import helmet from "helmet"
import cluster from "node:cluster"
import os from "os"
import { setupPrimary, createAdapter } from "@socket.io/cluster-adapter"
import morgan from "morgan"
import { serverLogger } from "./src/logger/conf/loggerConfiguration.js"

import authIndex from "./src/routes/authRouter.js"
import userRouter from "./src/routes/userRouter.js"
import factor2Router from "./src/routes/factor2Router.js"

import { connectData } from "./connection.js"
import { authenticateUser, factor2RouteTokenAuthenticator } from "./src/middlewares/AuthMiddlewares.js"
import { errorMiddleware } from "./src/middlewares/errorMiddleware.js"
import env from "./src/zodSchema/envSchema.js"

const numCPUs = os.availableParallelism()
const { PORT, CROSS_ORIGIN } = env 
morgan.token("authoken", (req, _res)=>{
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
    // creating a new server instance form the above server made with http. this server instance will be used for websock
    const io = new Server(server , {
        cors : {
            origin : CROSS_ORIGIN
        },
        adapter : createAdapter()
    })

    app.use(helmet())
    app.use(morgan("dev"))
    app.use(cors({
        origin : CROSS_ORIGIN
    }))
    app.use(compression())
    app.use(express.json())
    app.use(express.urlencoded({ extended : false}))
    app.use(express.static("src/uploads"))

    // if database connection is successfull then configuring the server to listen to the port
    connectData((err)=>{
        if(!err){
            server.listen(PORT , ()=> serverLogger.info("the server is running successfully"))
        }
        else {
            serverLogger.error(err)
        }
    })

    app.use("/auth-user", authIndex )

    app.use("/factor2", factor2RouteTokenAuthenticator , factor2Router)

    app.use("/user", authenticateUser, userRouter)
    app.get("/ping", (_req, res)=>{
        res.json("pong")
    })

    app.use(errorMiddleware)

    // the io instance of the server from the socket.io is used to listen for the connection event
    // if connected the socket object / instance will be given which will listen to customized eve
    io.on("connection" , (socket : Socket)=>{

        socket.on("join-room", (oldRoomId, newRoomId)=>{

            if(oldRoomId){
                socket.leave(oldRoomId)
            }
            socket.join(newRoomId)
            socket.emit("joined-chat", newRoomId)
        })

        socket.on("send-message", (roomId, data, chatType, chatId, groupChatData)=>{
            socket.to(roomId).emit("received-message", data, chatType, chatId, groupChatData )
        })

        socket.on("delete-message", (roomId, messageId, type, chatId)=>{
            socket.to(roomId).emit("delete-message", messageId, type, chatId)
        })

    })

}
