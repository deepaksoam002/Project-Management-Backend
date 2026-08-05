import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";


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

userSchema.pre("save", ()=>{

})

export const User = mongoose.model("User", userSchema);        // collection name will be users


