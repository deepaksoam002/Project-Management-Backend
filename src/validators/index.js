import { body } from "express-validator";


const userRegisterValidator = () => {

    return [
        
    body("email")
         .trim()
         .notEmpty()
         .withMessage("Email is required")
         .isEmail()
         .withMessage("Email is invalid")
         .normalizeEmail(),

    body("password")
         .trim()
         .notEmpty()
         .withMessage("Password is required")
         .isLength({min: 8})
         .withMessage("Password must be 8 charactor long")
         .isStrongPassword(
                {
                    minLength: 8,
                    minUppercase: 1,
                    minLowercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                }
             )
         .withMessage("Password must conatin at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"),

    body("username")
         .trim()
         .notEmpty()
         .withMessage("Username is required")
         .isLowercase()
         .withMessage("username must be in lower case")
         .isLength({ min: 3})
         .withMessage("Username must be atleast 3 charactor long"),

    body("fullname")
         .optional()
         .trim()
        
        
        
  ]
         
};


const userLoginValidator = () => {
    return [
        body("email")
            .optional()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),

        body("username")
            .optional()
            .notEmpty()
            .withMessage("Username is required"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")

    ]
}

const userChangeCurrentPasswordValidator = () => {

    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Old password is required"),

        body("newPassword")
            .notEmpty()
            .withMessage("New password is required"),    
    ]
}
const userForgotPasswordValidator = () => {

    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
    ]
}

const userResetForgotPasswordValidator = () => {

    return [
        body("newPassword")
            .notEmpty()
            .withMessage("New password is required"),
    ]
}

export {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator

}