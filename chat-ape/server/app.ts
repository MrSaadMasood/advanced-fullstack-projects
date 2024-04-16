import { Socket} from "socket.io"
import "express-async-errors"
import express from "express"
import compression from 'compression' 
import fs from 'fs' 
import path from 'path' 
import { Server } from "socket.io"
import https from 'https' 
import cors from "cors"
import helmet from "helmet"
import cluster from "node:cluster"
import os from "os"
import { setupPrimary, createAdapter } from "@socket.io/cluster-adapter"
import morgan from "morgan"
import { serverLogger } from "./src/logger/conf/loggerConfiguration"

import authIndex from "./src/routes/authRouter"
import userRouter from "./src/routes/userRouter"
import factor2Router from "./src/routes/factor2Router"

import { connectData } from "./connection"
import { authenticateUser, factor2RouteTokenAuthenticator } from "./src/middlewares/middlewares"
import dotenv from "dotenv"
import { errorMiddleware } from "./src/middlewares/errorMiddleware"
dotenv.config()

const numCPUs = os.availableParallelism()
const { PORT, CROSS_ORIGIN } = process.env
const dirPath = import.meta.dirname
const httpsServerOptions = {
    key : fs.readFileSync(path.join(dirPath, "./cert/private-key.pem")),
    cert : fs.readFileSync(path.join(dirPath, "./cert/public-key.pem"))
}

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
    const server = https.createServer(httpsServerOptions, app)
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

    app.use("/user", authenticateUser, userRouter)
    app.get("/random", (req, res)=>{
        res.json("this is running with htps server")
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

        socket.on("send-message", (roomId, data, chatType, groupChatData)=>{
            socket.to(roomId).emit("received-message", data, chatType, groupChatData )
        })

        socket.on("delete-message", (roomId, messageId, type)=>{
            socket.to(roomId).emit("delete-message", messageId, type)
        })

    })

}
