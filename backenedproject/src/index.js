//one way
// require('dotenv').config({path:'./env'});
import { app } from "./app.js";
import {connectDB} from "./db/index.js";

import dotenv from 'dotenv';

dotenv.config({path:'./.env'});

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log("Server is running on port:",process.env.PORT);
    })
})
.catch((err)=>{
    console.log("MONGO_DB CONNECTION FAILED",err);
})
 
 
 
 
 
 
 
 
 
 
 
 //1st Approach


// import mongoose from "mongoose"
// import {DB_NAME} from "./constants"
// import express from "express"

// const app = express()

// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MongoDB_URI}/${DB_NAME}`)
//         app.on("Error",(error)=>{
//             console.log("Error",error);
//             throw error;
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log("Server is running on port",process.env.PORT);
//         })
//     } catch (error) {
//         console.error("ERROR: ",error);
//     }
// })()

// //2nd approach db/index.js