import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";


export const verifyJwt = asyncHandler( async(req, res, next) => {

    const token = req.cookies?.accessToken || req.header.Authorization?.replace("Bearer ","")

    if(!token){
        throw new ApiError(401, "Unauthorized request")
    };

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select(
        "-password -isEmailVerified -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry"
         );

         if(!user){

            throw new ApiError(401, "Invalid access token")
         }

         req.user = user
 
         next()


    } catch (error) {
        throw new ApiError(401, "Invalid access token")
    }

})


export const verifyProjectRolePermissions = (allowedRole=[]) =>{

    return asyncHandler( async (req, res, next) => {

        const {projectId} = req.params;
        const userId = req.user._id;
        

        const project = await ProjectMember.findOne(
            {
                user: new mongoose.Types.ObjectId(userId),
                project: new mongoose.Types.ObjectId(projectId)
            }
        )
        
        if(!project){
            throw new ApiError(404,"Project not found")
        }
   
        const givenRole = project?.role;
        req.user.role = givenRole;

        if(!allowedRole.includes(givenRole)){
            throw new ApiError(
                400,
                "You don`t have permission to perform this action"
            )
        }

        next();
    })
}