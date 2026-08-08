import { User, user } from "../models/user.models.js";
import { Project } from "../models/project.models";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";



const getProjects = asyncHandler(async (req, res) => {

    const projects = await ProjectMember.aggregate(
        [
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user._id)   // At this point we get all object where client is a member in a project 
                }
            },
            {
                $lookup: {
                    from: "projects",
                    localField: "project",
                    foreignField: "_id",
                    as: "project",            // At this point we get all the project details from projects collection 
                    pipeline: [
                        {
                            $lookup: {
                                from: "projectmembers",
                                localField: "_id",
                                foreignField: "project",
                                as: "projectmembers"      // here we get all members related to those projects
                            }
                        }, {
                            $addFields: {
                                members: {
                                    $size: "$projectmembers"   // add new field to get total count of members
                                }
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$project"

            },
            {
                $project: {          // this is how final pipeline output look like
                    project: {
                        _id: 1,
                        name: 1,
                        description: 1,
                        members: 1,
                        createdBy: 1,
                        createdAt: 1,
                    },
                    role: 1,
                    _id: 0
                }
            }
        ]
    );

    if (!projects) {
        throw new ApiError(404, "Project not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                projects,
                "Projects fetch successfully"
            )
        )
})

const createProject = asyncHandler(async (req, res) => {

    const { name, description } = req.body;

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id)
    });

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: UserRolesEnum.ADMIN
    });


    return res.status(201)
        .json(
            new ApiResponse(
                200,
                project,
                "Project created successfully"
            )
        )

})

const getProjectsDetails = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const [project] = await Project.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(projectId)
            }
        }, {
            $lookup: {
                from: "projectmembers",
                localField: "_id",
                foreignField: "project",
                as: "projectmembers"
            }
        },
        {
            $addFields: {
                members: {
                    $size: "$projectmembers"
                }
            }
        }, {
            $project: {
                name: 1,
                description: 1,
                createdBy: 1,
                members: 1,
                createdAt: 1
            }
        }

    ])

    if (!project) {
        throw new ApiError(404, "Project not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                project,
                "project fetch successfully"
            )
        )

})

const updateProject = asyncHandler(async (req, res) => {

    const { name, description } = req.body;
    const { projectId } = req.params;

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description
        }, {
        new: true
    }
    )

    if (!project) {
        throw new ApiError(404, "Project not found")
    };

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                project,
                "Project update successfully"
            )
        )

})

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findByIdAndDelete(projectId);
    const projectMember = await ProjectMember.findOneAndDelete({ project: projectId });  // remove project member 

    if (!project) {
        throw new ApiError(404, "Project not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                project,
                "Project delete successfully"
            )
        )

})

const listProjectMember = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found")
    }

    const projectMembers = await ProjectMember.aggregate(
        [
            {
                $match: {
                    project: new mongoose.Types.ObjectId(projectId)
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
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
            }, {
                $addFields: {
                    user: {
                        $arrayElemAt: ["user", 0]
                    }
                }
            }, {
                $project: {
                    project: 1,
                    user: 1,
                    role: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    _id: 0
                }
            }
        ]
    )

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                projectMembers,
                "Project member fetched"
            )
        )

})

const addMemberToProject = asyncHandler(async (req, res) => {
    const { username, email, role } = req.body;
    const { projectId } = req.params;

    if (!username && !email) {

        throw new ApiError(400, "Username or Email is required")
    };

    const user = await User.findOne({
        $or: [{ userName: username }, { email }]
    });

    if (!user) {
        throw new ApiError(400, "User not exists")
    };

    await ProjectMember.findOneAndUpdate({
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId)
    }, {
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId),
        role: role
    }, {
        new: true,
        upsert: true
    }
    )

    return res.status(201)
        .json(
            new ApiResponse(
                200,
                {},
                "Project member added successfully"
            )
        )

})

const updateProjectMemberRole = asyncHandler(async (req, res) => {

    const { projectId, userId } = req.params;
    const { newRole } = req.body;

    if (!AvailableUserRoles.includes(newRole)) {
        throw new ApiError(400, "Invalid role")
    }

    const isProjectMemberExists = await ProjectMember.findOne(
        {
            user: new mongoose.Types.ObjectId(userId),
            project: new mongoose.Types.ObjectId(projectId)
        }
    )

    if (!isProjectMemberExists) {
        throw new ApiError(400, "Project member not found")
    }

    const projectMember = await ProjectMember.findByIdAndUpdate(
        isProjectMemberExists._id, {
        role: newRole
    }, {
        new: true
    }
    )

    if (!projectMember) {
        throw new ApiError(400, "Project member not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, projectMember, "Project member role updated successfully")
        )

});

const removeProjectMember = asyncHandler(async (req, res) => {

    const { projectId, userId } = req.params;


    const isProjectMemberExists = await ProjectMember.findOne(
        {
            user: new mongoose.Types.ObjectId(userId),
            project: new mongoose.Types.ObjectId(projectId)
        }
    )

    if (!isProjectMemberExists) {
        throw new ApiError(400, "Project member not found")
    }


    await ProjectMember.findOneAndDelete(
        {
            user: new mongoose.Types.ObjectId(userId),
            project: new mongoose.Types.ObjectId(projectId)
        }
    )

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Project member remove successfully"
            )
        )


})



export {
    createProject,
    getProjects,
    getProjectsDetails,
    updateProject,
    deleteProject,
    listProjectMember,
    addMemberToProject,
    updateProjectMemberRole,
    removeProjectMember
}