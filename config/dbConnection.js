const mongoose = require("mongoose");
require("dotenv").config();

const _db = async()=>{
    try{
        mongoose.set('strictQuery', true);
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Connected to MongoDB",connect.connection.host,
        connect.connection.name);
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

module.exports = _db;