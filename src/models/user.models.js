import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";


const userSchema = new Schema(
    {
        avatar:{

            type: {
                url : String,
                localPath : String,
            },
            default:{
                url:"https://placehold.co/200x200",
                localPath: ""
            }
        },
        userName: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            trim: true,

        },
        fullName: {
            type: String,
            trim: true
        },
        password: {
            type: String,
            require: [true, "password is required"]
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String
        },
        forgotPasswordToken: {
            type: String
        },
        forgotPasswordExpiry: {
            type: String
        },
        emailVerificationToken: {
            type: String
        },
        emailVerificationExpiry: {
            type: String
        }
    },{
        timestamps: true,
    }
)

// hash password before save to mongodb
userSchema.pre("save", async function (next){

    if(!this.ismodified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();

})

// check password is correct or not 
userSchema.methods.isPasswordCorrect = async function(password){
        
     return await bcrypt.compare(password, this.password);
};


//generate Access Token

userSchema.methods.generateAccessToken = function(){

   return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.userName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// generate refresh token

userSchema.methods.generateRefreshToken = function(){

   return jwt.sign(
        {
            _id: this._id

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// Generate temporary token

userSchema.methods.generateTemporaryToken = function(){

    const unhashToken = crypto.randomBytes(20).toString("hex");

    const hashToken = crypto
    .createHash("sha256")
    .update(unhashToken)
    .digest("hex")


    const tokenExpiry = Date.now() + (20*60*1000)   // 20min

    return { unhashToken, hashToken, tokenExpiry }
}


export const User = mongoose.model("User", userSchema);        // collection name will be users


