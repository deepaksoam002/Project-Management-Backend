import { Router } from "express";
import { registerUser, login } from "../controllers/auth.controllers.js";
import { userRegisterValidator, userLoginValidator } from "../validators/index.js"
import { validate } from "../middlewares/validator.middlewares.js";

const router = Router();

const test = async ( req, res, next) => { 

    const body = req.body;

    await console.log( "req body:", body);

    return next()


}


router.route("/register").post( test, userRegisterValidator(), validate, registerUser);

router.route("/login").post(test, userLoginValidator(), validate, login);




export default router;