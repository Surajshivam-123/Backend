import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//The cors module in Express.js allows your backend (Node.js server) to safely share resources with a frontend hosted on a different domain or port (called cross-origin requests).
const app = express();
// express() is a function provided by the Express module.
// When you call it, it returns an app object that represents your web application.
// You use this app object to define your routes, middleware, server settings, etc.


app.use(cors({
    origin:process.env.CORS_ORIGIN,//allowed origin (the frontend URL that can access the backend).
    credentials:true//allows the server to accept cookies, authorization headers, or credentials (like JWT in cookies) from the frontend.
}));

app.use(express.json({limit:"16kb"}));//to get json file
//app.use(...)=>	Adds middleware to handle every request
// 1. express.json()
// This is a built-in middleware in Express.
// It parses incoming requests with JSON payloads.
// The parsed data becomes available in req.body.

app.use(express.urlencoded({extended:true,limit:"16kb"}));//to get data from url
app.use(express.static("public"));//to keepimage and extra thing
//This line tells Express to serve static files (like HTML, CSS, JS, images, etc.) from a folder named "public".
app.use(cookieParser());
//cookie-parser is a middleware in Express used to parse cookies from the HTTP request headers and make them easily accessible in req.cookies.
app.get('/profile', (req, res) => {
  console.log(req.cookies); // { token: 'abc123' }
});


//use of router
import {userRouter} from './routes/user.routes.js';
import {videoRouter} from './routes/video.routes.js';
import {subscriptionRouter} from './routes/subscription.route.js';
import {tweetRouter} from './routes/tweet.routes.js';
import {playlistRouter} from './routes/playlist.routes.js';
import { commentRouter } from "./routes/comment.routes.js";
import { likeRouter } from "./routes/like.routes.js";

app.use("/api/v1/users",userRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/subscription",subscriptionRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/playlist",playlistRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/like",likeRouter);

export {app};