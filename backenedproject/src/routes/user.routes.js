import {Router} from "express";
import {registerUser} from "../controllers/user.controllers.js"
const router = Router();

router.route("/register").post(registerUser);
//https://localhost:8000/users/register
export default  router;