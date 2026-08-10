import { Project } from "../models/project.models.js";
import { ProjectNote } from "../models/note.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";


const getProjectNotes = asyncHandler( async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if(!project){

        throw new ApiError(404, "Project not found")
    }

    const notes = await ProjectNote.find({
        project: projectId
    }) 

    if(!notes){

         throw new ApiError(404, "Notes not found")
    }

    return res.status(200)
      .json(
         new ApiResponse(
            200,
            notes,
            "Project notes fetched successfully"
         )
      )

})

const createProjectNote = asyncHandler( async (req, res) => {
    const { projectId } = req.params;
    const { content } = req.body;

    const project = await Project.findById(projectId);

    if(!project){

        throw new ApiError(404, "Project not found")
    }  

    const note = await ProjectNote.create({
        project: projectId,
        createdBy: req.user._id,
        content
    })

    if(!note){

        throw new ApiError(400, "Internal server error while creating note")
    }  

    return res.status(201)
       .json(
         new ApiResponse(
            200,
            note,
            "Note created successfully"
         )
       )

})

const getNoteById = asyncHandler( async (req, res) => {
    const { projectId, noteId } = req.params

    const note = await ProjectNote.findOne({
        _id: noteId,
        project: projectId
    })

    if(!note){
        throw new ApiError(404, "Notes not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            note,
            "Notes fetched successfully"
        )
    )

})

const updateNote = asyncHandler( async(req, res) => {

     const { projectId, noteId } = req.params
     const { content } = req.body

    const note = await ProjectNote.findOne({
        _id: noteId,
        project: projectId
    })

    if(!note){
        throw new ApiError(404, "Notes not found")
    }

    const updatedNote = await ProjectNote.findOneAndUpdate({
        _id: noteId,
        project: projectId
    },
    { content },
    { new: true }
    );

    return res.status(200)
     .json(
        new ApiResponse(
            200,
            updatedNote,
            "Notes updated successfully"
        )
     )


})

const deleteNote = asyncHandler( async(req, res) => {

    const { projectId, noteId } = req.params

    const note = await ProjectNote.findOne({
        _id: noteId,
        project: projectId
    })

    if(!note){
        throw new ApiError(404, "Notes not found")
    }

    await ProjectNote.findByIdAndDelete(noteId)

    return res.status()
      .json(
        new ApiResponse(
            200,
            {},
            "Note deleted Successfully"
        )
      )
    
})


export {
    getProjectNotes,
    createProjectNote,
    getNoteById,
    updateNote,
    deleteNote
}

