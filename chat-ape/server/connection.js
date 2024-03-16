const { MongoClient } = require("mongodb");
require("dotenv").config()

let database;

// connecting to the database based on the url. and the database we want to connect to
module.exports = {
    connectData : (callback)=>{
        MongoClient.connect(process.env.MONGO_URL).then(connection=>{
             database= connection.db("chat-app")
             console.log("the databse connection is successfull")
            return callback()
        }).catch(error =>{
            return callback(error)
        })
    },

    getData : ()=> database,
}