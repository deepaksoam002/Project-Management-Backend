import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { matchedData } from "express-validator";


const getTask = asyncHandler(async (req, res) => {

    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found")
    }

    const tasks = await Task.find({
        project: project._id
    }).populate("assignedTo", "avatar userName fullName email")


    if (!tasks) {
        throw new ApiError(404, "No Tasks Found")
    }

    return res.status(201)
        .json(
            new ApiResponse(
                201,
                tasks,
                "Task fetched successfully"
            )
        )


})
const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, status } = req.body;

    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(400, "Project not found");
    };

    const files = req.files || [];  //here we suppose multer provide files

    const attachments = files.map((file) => {
        return {
            url: `${process.env.Server_URL}/public/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size
        }
    });

    const task = await Task.create({
        title,
        description,
        assignedTo: assignedTo ? assignedTo : undefined,
        assignedBy: req.user._id,
        project: project._id,
        status,
        attachments,
    })

    if (!task) {
        throw new ApiError(500, "Internal Server Error while creating task")
    };

    return res.status(201)
        .json(
            new ApiResponse(
                201,
                task,
                "Task created successfully"
            )
        )



})
const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        $project:{
                        _id: 1,
                        userName: 1,
                        fullName: 1,
                        avatar: 1
                    }
                    }
                ]
            }
        },
{
    $lookup: {
        from: "subtasks",
            localField: "_id",
                foreignField: "task",
                    as: "subtasks",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "users",
                                    localField: "createdBy",
                                    foreignField: "_id",
                                    as: "createdBy",
                                    pipeline: [
                                        {
                                            $project: {
                                                _id: 1,
                                                userName: 1,
                                                fullName: 1,
                                                avatar: 1

                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                $addFields: {
                                    createdBy: {
                                        $arrayElemAt: ["$createdBy", 0]
                                    }
                                }
                            }

                        ]

    }
},
{
    $addFields: {
        assignedTo: {
            $arrayElemAt: ["$assignedTo", 0]
        }
    }
}
    ]);

if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found")
}

return res.status(200)
    .json(
        new ApiResponse(
            200,
            task,
            "Task fetched successfully"
        )
    )

})
const updateTask = asyncHandler(async (req, res) => {

    const { projectId, taskId } = req.params;
    const update = matchedData(req, { locations: ["body"]});
    
    
    
     const tasks = await Task.findone({
        _id: taskId,
        project: projectId
     });

    if (!tasks) {
        throw new ApiError(404, "No Tasks Found")
    }
    
    const updatedTasks = await Task.findOneAndUpdate({
        _id: taskId,
        project: projectId
     },
     {
        $set: update
     },
     {
        new: true
     }
    );


    return res.status(200)
       .json(
          new ApiResponse(
            200,
            updatedTasks,
            "Task updated successfully"
          )
       )




})
const deleteTask = asyncHandler(async (req, res) => {

     const { projectId, taskId } = req.params;
    
    
     const tasks = await Task.findone({
        _id: taskId,
        project: projectId
     });

    if (!tasks) {
        throw new ApiError(404, "No Tasks Found")
    }

     await Task.findOneAndDelete({
        _id: taskId,
        project: projectId
     });


    return res.status(200)
       .json(
          new ApiResponse(
            200,
            {},
            "Task deleted Successfully"
          )
       )

})
const getSubTask = asyncHandler( async (req, res) => {

    const {projectId, taskId} = req.params

    const task = await Task.findOne({
        _id: taskId,
        project: projectId
    })

    if(!task){
        throw new ApiError(404, "Task not found")
    };

    const subTasks = await SubTask.find({
        task: taskId
    })

    if(!subTasks){
        throw new ApiError(404, "subTask not found")
    };

    return res.status(200)
     .json(
        new ApiResponse(
            200,
            subTasks,
            "subTask fetched successfully"
        )
     )
    
})
const createSubtask = asyncHandler(async (req, res) => {
    const { title, description, isCompleted } = req.body;

    const { projectId, taskId } = req.params;

    const task = await Task.findOne({
        _id:taskId,
        project: projectId
    });

    if (!task) {
        throw new ApiError(400, "Task not found");
    };


    const subTask = await SubTask.create({
        title,
        description,
        task: taskId,
        isCompleted,
        createdBy: req.user._id,   
    })

    if (!subTask) {
        throw new ApiError(500, "Internal Server Error while creating subtask")
    };

    return res.status(201)
        .json(
            new ApiResponse(
                201,
                subTask,
                "Task created successfully"
            )
        )
 

})
const updateSubtask = asyncHandler(async (req, res) => {

    const { projectId, subTaskId } = req.params;

    const update = matchedData(req, {locations: ["body"]});

    const subTask = await SubTask.findById(subTaskId);

    if(!subTask){
        throw new ApiError(404, "SubTask not found")
    }

    const isTaskExists = await Task.findOne({
        _id: subTask.task,
        project: projectId

    })

     if(!isTaskExists){
        throw new ApiError(404, "Task not found")
    }

    const updatedSubTasks = await SubTask.findByIdAndUpdate(
        subTaskId,
        update,
        {
          new: true
    })

    return res.status(200)
       .json(
         new ApiResponse(
            200,
            updatedSubTasks,
            "Subtask updated successfully"
         )
       )

})
const deleteSubtask = asyncHandler(async (req, res) => {
 
    const { projectId, subTaskId } = req.params;


    const subTask = await SubTask.findById(subTaskId);

    if(!subTask){
        throw new ApiError(404, "SubTask not found")
    }

    const isTaskExists = await Task.findOne({
        _id: subTask.task,
        project: projectId

    })

     if(!isTaskExists){
        throw new ApiError(404, "Task not found")
    }

     await SubTask.findByIdAndDelete(
        subTaskId
       )

    return res.status(200)
       .json(
         new ApiResponse(
            200,
            {},
            "Subtask deleted successfully"
         )
       )

})


export {
    getTask,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    getSubTask,
    createSubtask,
    updateSubtask,
    deleteSubtask
}