import mongoose, { Schema} from "mongoose";


const subTaskSchema = new Schema(
    {
         tittle: {
              type: String,
              required: true,
              trim: true
         },
         description: {
               type: String
         },
         task: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: true
         },
         isCompleted: {
            type: Boolean,
            default: false
         },
         createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
         }

    },{
        timestamps: true
    }
);


export const SubTask = mongoose.model("SubTask", subTaskSchema);