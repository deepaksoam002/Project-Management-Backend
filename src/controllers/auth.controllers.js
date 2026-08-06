import { User } from "../models/user.models.js"; 
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler} from "../utils/asyncHandler.js";
import { sendEmail, emailVerificationMailContent} from "../utils/mail.js";

const generateAccessAndRefreshToken =  async (userId) => {

    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
    
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken};

    } catch (error) {
        
        console.log("Error:",error);
        throw new ApiError(500,"Internal server error while generating accessToken and refreshToken")
    }
}

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

const login = asyncHandler( async(req, res) => {
    const {email, password, username} = req.body;

    if(!email && !username){
        throw new ApiError(400, "Username and email is required")
    }

    const user = await User.findOne({  
        $or: [{ email }, { userName: username }]
    });


    if(!user){
        throw new ApiError(400, "User does not exists")
    };

    const isPasswordValid = user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(400, "Invalid Credentials")
    };


    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    
    const loggedInUser = await User.findById(user._id).select(
        "-password -isEmailVerified -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry"
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie ("refreshToken", refreshToken, options)
        .json( new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        ));

})





export {
    registerUser,
    login,
}