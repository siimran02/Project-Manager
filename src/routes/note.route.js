import { Router } from "express";
import {
      addNote, editnote, deletenote
} from "../controller/note.controller.js";
 
import{validate} from "../middlewares/validator.middleware.js"

import{ 
    verifyJWT,
 } from "../middlewares/auth.middleware.js";

 import { UserRolesEnum, AvailableUserRole } from "../utils/constants.js";
const router = Router();
router.use(verifyJWT);
router.route("/add/:projectId").post(addNote);
router.route("/edit/:noteId").put(editnote);
router.route("/delete/:noteId").delete(deletenote);

export default router;