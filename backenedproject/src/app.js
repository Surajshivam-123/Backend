import express from "express"
import cors from "cors"
import cookieParser from "cookieParser"

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))//to get json file
app.use(express.urlencoded({extended:true,limit:"16kb"}))//to get data from url
app.use(express.static("public"))//to keepimage and extra thing
app.use(cookieParser())

export {app}