import {User} from "../models/user.models.js";
import{ ProjectMember} from "../models/projectmember.models.js";
import {ApiError} from "../utils/api-error.js";
import{asyncHandler} from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Task } from "../models/task.model.js";

export const verifyJWT = asyncHandler(async(req , res , next)=>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if(!token){
        throw new ApiError(401, "Unautheorized request")
    }

    try{
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

        if(!user){
        throw new ApiError(401, "Unautheorized request")
    }
    req.user = user

    next()
    } catch(error){
        throw new ApiError(401, "Unautheorized request");
    }
})

export const validateProjectPermission = (roles = []) =>
    asyncHandler(async (req, res, next) => {
        const { projectId } = req.params;

        if (!projectId) {
            throw new ApiError(400, "project id is missing");
        }

        const project = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id),
        });

        if (!project) {
            throw new ApiError(404, "project not found or you are not a member");
        }

        const givenRole = project.role;

        if (!roles.includes(givenRole)) {
            throw new ApiError(
                403,
                "You do not have permission to perform this action"
            );
        }

        req.user.role = givenRole; // optional
        next();
    });
export const validateTaskOwner = asyncHandler(async (req, res, next) => {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (task.assignedBy?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the task creator can update this task");
    }

    req.task = task;
    next();
});