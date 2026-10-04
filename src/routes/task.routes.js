import { Router } from "express";
import {
      getTasks,
      createTask,
      getTaskById,
      updateTask,
      deleteTask,
      getSubTasks,
      createSubTask,
      updateSubTask,
      deleteSubTask
} from "../controller/task.controllers.js"
 
import{validate} from "../middlewares/validator.middleware.js"

import {
    createTaskValidator
} from "../validator/index.js";

import{ 
    verifyJWT,
    validateProjectPermission,
    validateTaskOwner
 } from "../middlewares/auth.middleware.js";

 import { UserRolesEnum, AvailableUserRole } from "../utils/constants.js";


const router = Router();
router.use(verifyJWT)
router.route("/getTasks/:projectId").get(getTasks);
router.route("/create/:projectId").post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createTaskValidator(),
    validate,
    createTask
);
router.route("/get/:taskId").get(getTaskById);
router.route("/update/:taskId").put(
    validateTaskOwner,
    createTaskValidator(),
    validate,
    updateTask
);
router.route("/createsubtask/:taskId").post(createSubTask);
router.route("/getsubtasks/:taskId").get(getSubTasks);
router.route("/updatesubTask/:subTaskId").put(updateSubTask);
router.route("/deletesubtask/:subTaskId").delete(deleteSubTask);
export default router;
