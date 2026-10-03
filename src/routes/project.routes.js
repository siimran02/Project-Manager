import { Router } from "express";
import {
    createProject,
    updateProject,
    deleteProject,
    getProjects,
    getProjectById,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember 
} from "../controller/project.controllers.js"
 
import{validate} from "../middlewares/validator.middleware.js"

import {
    createProjectValidator,
    addMemberToProjectValidator
} from "../validator/index.js";

import{ 
    verifyJWT,
    validateProjectPermission
 } from "../middlewares/auth.middleware.js";

 import { UserRolesEnum, AvailableUserRole } from "../utils/constants.js";


const router = Router();
router.use(verifyJWT)
router
    .route("/")
    .get(getProjects)
    .post(createProjectValidator(),validate,createProject);
router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getProjectById)
    .put(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject
    )
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteProject
    )
router
    .route("/:projectId/members")
    .get(getProjectMembers)
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        addMemberToProjectValidator(),
        validate,
        addMembersToProject
    )
router
    .route("/:projectId/members/:userId")
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteMember)


export default router;