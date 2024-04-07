import { Socket} from "socket.io"

import express from "express"
import { Server } from "socket.io"
import http from "http"
import cors from "cors"
import helmet from "helmet"
import cluster from "node:cluster"
import os from "os"
import { setupPrimary, createAdapter } from "@socket.io/cluster-adapter"
import morgan from "morgan"
import { serverLogger } from "./logger/conf/loggerConfiguration"

import authIndex from "./routes/authUser"
import userRouter from "./routes/userRouter"
import factor2Router from "./routes/factor2Auth"

import { connectData } from "./connection"
import { authenticateUser, factor2RouteTokenAuthenticator } from "./middlewares/middlewares"
import dotenv from "dotenv"
dotenv.config()

const numCPUs = os.availableParallelism()
const { PORT, CROSS_ORIGIN } = process.env

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
    // if connected the socket object / instance will be given which will listen to customized eve
    io.on("connection" , (socket : Socket)=>{

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