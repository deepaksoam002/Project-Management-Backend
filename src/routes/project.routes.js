import { Router } from "express";
import { addMemberToProject, createProject, deleteProject, getProjects, getProjectsDetails, listProjectMember, removeProjectMember, updateProject, updateProjectMemberRole } from "../controllers/project.controllers.js";
import { addMemberToProjectValidator, createProjectValidator, updateProjectMemberRoleValidator, updateProjectValidator } from "../validators/index.js"
import { validate } from "../middlewares/validator.middlewares.js";
import { verifyJwt, verifyProjectRolePermissions } from "../middlewares/auth.middlewares.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";


const router = Router();


router.use(verifyJwt)

router.route("/")
.get(getProjects)
.post(createProjectValidator(),validate,createProject);

router.route("/:projectId/members")
.get(listProjectMember)
.post(addMemberToProjectValidator(), validate, addMemberToProject)

router.route("/:projectId")
.get(verifyProjectRolePermissions(AvailableUserRoles),getProjectsDetails)
.put(verifyProjectRolePermissions([UserRolesEnum.ADMIN]), updateProjectValidator(), validate, updateProject)
.delete(verifyProjectRolePermissions([UserRolesEnum.ADMIN]), deleteProject)


router.route("/:projectId/members/:userId")
.put(verifyProjectRolePermissions([UserRolesEnum.ADMIN]), updateProjectMemberRoleValidator(), validate, updateProjectMemberRole)
.delete(verifyProjectRolePermissions([UserRolesEnum.ADMIN]), removeProjectMember)




export default router ;