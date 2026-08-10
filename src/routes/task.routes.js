import { Router } from "express";
import {  getTask, createTask, getTaskById, updateTask, deleteTask, createSubtask, updateSubtask, deleteSubtask, getSubTask } from "../controllers/task.controllers.js";
import {  createTaskValidator, updateTaskValidator, createSubTaskValidator, updateSubTaskValidator, } from "../validators/index.js"
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJwt, verifyProjectRolePermissions } from "../middlewares/auth.middlewares.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";
import { upload } from "../middlewares/uploader.middlewares.js";


const router = Router();


router.use(verifyJwt)
router.route("/:projectId")
.get(verifyProjectRolePermissions(AvailableUserRoles), getTask)
.post(verifyProjectRolePermissions([UserRolesEnum.ADMIN,UserRolesEnum.PROJECT_ADMIN]), upload.array('files'), createTaskValidator(), validate, createTask)

router.route("/:projectId/t/:taskId")
.get(verifyProjectRolePermissions(AvailableUserRoles),getTaskById)
.put(verifyProjectRolePermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), updateTaskValidator(), validate, updateTask)
.delete(verifyProjectRolePermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteTask)


router.route("/:projectId/t/:taskId/subtasks")
.get(verifyProjectRolePermissions(AvailableUserRoles),getSubTask)
.post(verifyProjectRolePermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), createSubTaskValidator(), validate, createSubtask)

router.route("/:projectId/st/:subTaskId")
.put(verifyProjectRolePermissions(AvailableUserRoles),updateSubTaskValidator(), validate, updateSubtask)
.delete(verifyProjectRolePermissions([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteSubtask)


export default router