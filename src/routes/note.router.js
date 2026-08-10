import { Router } from "express";
import {   getProjectNotes, createProjectNote, getNoteById, updateNote, deleteNote } from "../controllers/note.controllers.js";
import {  createNotesValidator, updatesNotesValidator } from "../validators/index.js"
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJwt, verifyProjectRolePermissions } from "../middlewares/auth.middlewares.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";


const router = Router();

router.use(verifyJwt)
router.route("/:projectId")
.get(verifyProjectRolePermissions(AvailableUserRoles), getProjectNotes)
.post(verifyProjectRolePermissions([UserRolesEnum.ADMIN]), createNotesValidator(), validate, createProjectNote)


router.route("/:projectId/n/:noteId")
.get(verifyProjectRolePermissions(AvailableUserRoles), getNoteById)
.put(verifyProjectRolePermissions([UserRolesEnum.ADMIN]), updatesNotesValidator(), validate, updateNote)
.delete(verifyProjectRolePermissions([UserRolesEnum.ADMIN]), deleteNote)


export default router;