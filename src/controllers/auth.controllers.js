import { User } from "../models/user.models.js"; 
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler} from "../utils/asyncHandler.js";
import { sendEmail, emailVerificationMailContent, forgotPasswordMailContent} from "../utils/mail.js";
import  crypto  from "crypto";
import jwt from "jsonwebtoken";


const options = {
        httpOnly: true,
        secure: true
    };

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

const logout = asyncHandler( async(req, res) => {

   await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:""
        }
    }
   );

   res.status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json( new ApiResponse(200,{},"User logout successfully"))

});


const currentUser = asyncHandler( async(req, res) => {

    return res.status(200)
      .json(
         new ApiResponse(
            200,
             {
                user : req.user
             },
             "Current user fetched successfully"  
            ))

});


const verifyEmail = asyncHandler( async(req, res) => {

    const { verificationToken} = req.params;

    if(!verificationToken){
        throw new ApiError(400, "Email verification token is missing")
    }

    let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

    const user = await User.findOne({
        emailVerificationToken : hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
    });

    if(!user){
        throw new ApiError( 400,"Token is invalid or expired")
    };

    // await User.findByIdAndUpdate(
    //     user._id,
    //     {
    //         $set:{
    //             isEmailVerified: true
    //         }
    //     },
    //     {
    //         new: true
    //     }
    // )  //or we can do this also
    
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    user.isEmailVerified = true;

    await user.save({validateBeforeSave: false})

    return res.status(200)
      .json( new ApiResponse(
        200,
        {
            isEmailVerified : true
        },
        "Email verified successfully"
      ))

})


const resendEmailVerification  = asyncHandler( async(req, res) => {

    const user = await User.findById( req.user?._id);

    if(!user){

        throw new ApiError( 404, "User does not exist" )
    }

    if(user.isEmailVerified){
        throw new ApiError( 409, "Email is already verified")
    }

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


    return res.status(200)
     .json(
          200,
          {},
          "Email has been send to your email Id"
     )

    
})


const newAccessToken = asyncHandler( async(req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken ;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized access");
    };
   
   try {
     const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

     const user = await User.findById(decodedToken?._id);
     
     if(!user){
        throw new ApiError(401, "Invalid refresh token")
     };

      if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh Token in expired")
      }

      const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id);

      user.refreshToken = newRefreshToken;
      user.save();

      return res.status(200)
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", newRefreshToken, options)
          .json(new ApiResponse(
            200,
            {
                accessToken,
                refreshToken: newRefreshToken
            },
            "Access token refresh"

          ))
 
   } catch (error) {

    throw new ApiError(401, "Invalid refresh token")
    
   }
     

    
})

const forgotPasswordRequest = asyncHandler( async(req, res) => {

    const {email, username} = req.body;

    if(!email && !username){

        throw new ApiError(400,"Email or Username is Required")
    }
    
    const user = User.findOne({
        $or: [{email}, {userName: username}]
    });

    if(!user){
      throw new ApiError(400,"User does not exists")
    }

    const {  unhashToken, hashToken, tokenExpiry }=  user.generateTemporaryToken()

    user.forgotPasswordToken = hashToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail({

        email: user?.email,
        subject: "Project Management : password reset request",
        mailGenContent: forgotPasswordMailContent(
            user?.userName,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unhashToken}`
        ),
    });
      
    return res.status(200)
      .json(new ApiResponse(200, {}, "Password reset mail has been send on your mail id"))
});

const resetForgotPassword = asyncHandler( async(req, res) => {
    
    const {resetToken} = req.params;
    const {newPassword} = req.body;

    let hashedToken = crypto
       .createHash("sha256")
       .update(resetToken)
       .digest("hex")

   const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    });
    
    if(!user){
        throw new ApiError(489, "Token is invalid or expired")
    }

    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    user.password = newPassword; // here mongoose pre hook hash this password

    await user.save({validateBeforeSave: false}); 

    return res.status(200)
           .json(
            new ApiResponse(
                200,
                {},
                "Password reset successfully"
           ))
})

const changeCurrentPassword = asyncHandler( async(req, res) => {

    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    
    const isPasswordValid =  await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordValid){
        throw new ApiError(400, "Invaild old password")
    };

    user.password = newPassword;
    user.save({validateBeforeSave: false});

    return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "password chnaged successfully"
                )
            )
})

export {
    registerUser,
    login,
    logout,
    currentUser,
    verifyEmail,
    resendEmailVerification,
    newAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword
}