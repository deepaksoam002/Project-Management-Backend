import { User } from "../models/user.models.js"; 
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler} from "../utils/asyncHandler.js";
import { sendEmail, emailVerificationMailContent} from "../utils/mail.js";

const generateAccessAndRefreshToken = asyncHandler( async (userId) => {

    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();


    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false})
})
const registerUser = asyncHandler( async (req, res) => {

    const {email, username, password, role} = req.body

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    });

    if(existedUser){
        throw new ApiError(409, "User email and username already exists")
    }

    const user = await User.create({
        email,
        password,
        userName : username,
        isEmailVerified: false
    });

    generateAccessAndRefreshToken(user?._id);

   const {  unhashToken, hashToken, tokenExpiry }=  user.generateTemporaryToken()

    user.emailVerificationToken = hashToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail({

        email: user?.email,
        subject: "Verify your email for Project Management",
        mailGenContent: emailVerificationMailContent(
            user?.userName,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashToken}`,
        ),
    });

    const createdUser = await User.findById(user?._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user ")
    }

    res.status(201).json( new ApiResponse(
        201,
        {user: createdUser},
        "User registered successfully and verification email has been sent on your email",   
    ))


})





export {
    registerUser,
}