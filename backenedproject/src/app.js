import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
//The cors module in Express.js allows your backend (Node.js server) to safely share resources with a frontend hosted on a different domain or port (called cross-origin requests).
const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,//allowed origin (the frontend URL that can access the backend).
    credentials:true//allows the server to accept cookies, authorization headers, or credentials (like JWT in cookies) from the frontend.
}))

app.use(express.json({limit:"16kb"}))//to get json file
app.use(express.urlencoded({extended:true,limit:"16kb"}))//to get data from url
app.use(express.static("public"))//to keepimage and extra thing
app.use(cookieParser())
app.get('/profile', (req, res) => {
  console.log(req.cookies); // { token: 'abc123' }
});

//use of router
import router from './routes/user.routes.js';

app.use("/api/v1/users",router);
export {app}