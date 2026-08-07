import { Router } from "express";
import { registerUser, login, logout, verifyEmail, newAccessToken, forgotPasswordRequest, resetForgotPassword, currentUser, changeCurrentPassword, resendEmailVerification } from "../controllers/auth.controllers.js";
import { userRegisterValidator, userLoginValidator, userForgotPasswordValidator, userResetForgotPasswordValidator, userChangeCurrentPasswordValidator } from "../validators/index.js"
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();


// Unsecure routes
router.route("/register")
      .post(userRegisterValidator(), validate, registerUser);
router.route("/login")
      .post(userLoginValidator(), validate, login);
router.route("/verify-email/:verificationToken")
      .get(verifyEmail);
router.route("/refresh-token")
      .post(newAccessToken);
router.route("/forgot-password")
      .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset-password/:resetToken")
      .post( userResetForgotPasswordValidator(), validate, resetForgotPassword);



// secure routes
router.route("/logout")
      .post(verifyJwt, logout);
router.route("/current-user")
      .get(verifyJwt, currentUser);
router.route("/change-password")
      .post(verifyJwt, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/resend-email-verification")
      .post(verifyJwt, resendEmailVerification);




export default router;