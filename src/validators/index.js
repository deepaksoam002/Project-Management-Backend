import { body } from "express-validator";
import { AvailableTaskStatues, AvailableUserRoles } from "../utils/constants.js";


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
    ]
}

const createProjectValidator = () =>{
    return [
        body("name")
           .notEmpty()
           .withMessage("Name field is required"),
          
        body("description")
            .optional()   
    ]
}

const updateProjectValidator = () =>{
    return [
        body("name")
           .optional()
           .notEmpty()
           .withMessage("Name field is required"),
          
        body("description")
            .optional()     
    ]
}

const addMemberToProjectValidator = () =>{
    return [
        body("name")
           .optional()
           .notEmpty()
           .withMessage("Name field is required"),

        body("username")
           .optional()
           .notEmpty()
           .withMessage("Name field is required"),
        
        body("role")
          .notEmpty()
          .withMessage("Role field is required")
          .isIn(AvailableUserRoles)
          .withMessage("Role is invalid")

    ]
}

const updateProjectMemberRoleValidator = () =>{
    return[
         body("role")
          .notEmpty()
          .withMessage("Role field is required")
          .isIn(AvailableUserRoles)
          .withMessage("Role is invalid")
    ]
}

const createTaskValidator = () => {
    return [
        body("title")
        .notEmpty()
        .withMessage("title is required"),
        body("description")
        .optional(),
        body("assignedTo")
        .optional(),
        body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn(AvailableTaskStatues)
        .withMessage("Status is invalid")
        
    ]
}

const updateTaskValidator = () => {
    return [
         body("title")
         .optional()
        .notEmpty()
        .withMessage("title is required"),
        body("description")
        .optional(),
        body("assignedTo")
        .optional(),
        body("status")
        .optional()
        .notEmpty()
        .withMessage("Status is required")
        .isIn(AvailableTaskStatues)
        .withMessage("Status is invalid")
        
    ]
}

const createSubTaskValidator = () => {
    return [
         body("title")
        .notEmpty()
        .withMessage("title is required"),
        body("description")
        .optional(),
        body("isCompleted")
        .optional()
    ]
}
const updateSubTaskValidator = () => {
    return [
         body("title")
         .optional()
        .notEmpty()
        .withMessage("title is required"),
        body("description")
        .optional(),
        body("isCompleted")
        .optional()

    ]
}

const createNotesValidator = () => {
    return [
         body("content")
        .notEmpty()
        .withMessage("content is required"),
    ]
}

const updatesNotesValidator = () => {
    return [
         body("content")
        .notEmpty()
        .withMessage("content is required"),
    ]
}

export {
    userRegisterValidator,
    userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator,
    createProjectValidator,
    updateProjectValidator,
    addMemberToProjectValidator,
    updateProjectMemberRoleValidator,
    createTaskValidator,
    updateTaskValidator,
    createSubTaskValidator,
    updateSubTaskValidator,
    createNotesValidator,
    updatesNotesValidator

}