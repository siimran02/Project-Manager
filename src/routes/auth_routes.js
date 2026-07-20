import { Router } from "express";

import {registerUser, login} from "../controller/auth.controllers.js"

import{validate} from "../middlewares/validator.middleware.js"
import { userRegisterValidator,userLoginValidator } from "../validator/index.js";
const router = Router();


router.route("/register").post(userRegisterValidator() ,validate, registerUser);
router.route("/login").post(userLoginValidator(),validate, login);
export default router;