import { Router } from "express";
import { registerUser, login, logout } from "../controllers/auth.controllers.js";
import { userRegisterValidator, userLoginValidator } from "../validators/index.js"
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();



router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/logout").post(verifyJwt, logout);




export default router;