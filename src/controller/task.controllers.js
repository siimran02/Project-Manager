import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import {Project} from "../models/project.models.js";
import{ Task } from "../models/task.model.js"
import{ Subtask } from "../models/subtask.models.js"
import {UserRolesEnum, AvailableUserRole} from "../utils/constants.js"
import mongoose from "mongoose"

const getTasks = asyncHandler(async(req,res)=>{
    const{projectId} = req.params;
    const project = await Project.findById(projectId);
    if(!project){
        throw new ApiError(404, "Project not found");
    }
    const task = await Project.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(projectId),
            }
        },
        {
            $lookup:{
                from:"tasks",
                localField: "_id",
                foreignField:"project",
                as:"tasks",

            }
        },
        {
            $addFields:{
                tasks:{
                    $arrayElemAt:["$tasks",0]
                }
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, task[0] , "Task created successfully"));
})
const createTask = asyncHandler(async(req,res)=>{
    const{title,description,assignedTo, status} = req.body;
    const{projectId} = req.params;
    const project = await Project.findById(projectId);
    if(!project){
        throw new ApiError(404, "Project not found");
    }
    const files = req.files || [];

    const attachments = files.map((file)=>{
        return{
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype : file.mimetype,
            size:file.size
        }
    })

    const task = await Task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo? new mongoose.Types.ObjectId
        (assignedTo) : undefined,
        status,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments
    })
    return res.status(201).json(new ApiResponse(201, task , "Task created successfully"));
})
const getTaskById = asyncHandler(async(req,res)=>{
    const{ taskId } = req.params;
    const task = await Task.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "assignedTo",
                foreignField:"_id",
                as: "assignedTo",
                pipeline:[
                    {
                       $project:{
                         _id:1,
                        username:1,
                        fullName:1,
                        avatar:1
                       }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"subtasks",
                localField:"_id",
                foreignField:"task",
                as:"subtasks",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"createdBy",
                            foreignField:"_id",
                            as:"createdBy",
                            pipeline:[
                                {
                                    $project:{
                                        _id:1,
                                        username:1,
                                        fullName:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }

                    },
                    {
                        $addFields:{
                            createdBy:{
                                $arrayElemAt:["$createdBy",0]
                            }
                        }
                    },

                ]
            },
        },

        {
            $addFields:{
                assignedTo:{
                    $arrayElemAt:["$assignedTo", 0]
                }
            }
        }
        
    ])
    if(!task || task.length ===0){
        throw new ApiError(404, "Task not found")
    }
    return res.status(201).json(new ApiResponse(201, task[0] , "Task fetch successfully"));
})
const updateTask = asyncHandler(async(req,res)=>{
    const{title,description,assignedTo, status} = req.body;
    const{taskId} = req.params;
    if(!title || !description || !assignedTo || !status){
        throw new ApiError(404, "All fields are required");
    }
    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { 
            $set: { title, description, assignedTo, status } 
        }, {new: true});
    if(!updatedTask){
        throw new ApiError(404, "updation failed")
    }
    return res.status(200).json(new ApiResponse(200, updatedTask, "Task updated successfully"))

})
const deleteTask = asyncHandler(async(req,res)=>{
    const{taskId} = req.params;
    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(404, "Task not found");
    };
    const deletedTask = await Task.findByIdAndDelete(taskId);
    if(!deletedTask){
        throw new ApiError(404, "Sorry, we cannt delete the task")
    }
    return res.status(200).json(new ApiResponse(200, deletedTask,"task deleted successfully"));

})
const createSubTask = asyncHandler(async(req,res)=>{
    const{ taskId } = req.params;
    const{ title } = req.body;
    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(404, "Task not found");
    }
    const subTask = await Subtask.create({
        title,
        task: new mongoose.Types.ObjectId(taskId),
        createdBy:new mongoose.Types.ObjectId(req.user._id)
    })
    if(!subTask){
        throw new ApiError(404,"SubTask creation failed");
    }
    return res.status(201).json(new ApiResponse(201, subTask, "Subtask created successfully"));
})
const getSubTasks = asyncHandler(async(req,res)=>{
    const{ taskId } = req.params;
    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(404, "Task not found");
    }
   const subTasks = await Subtask.find({ task: taskId }).populate("createdBy", "username fullName avatar");
    return res.status(200).json(new ApiResponse(200, subTasks,"subtasks fetch successfully"))


})
const updateSubTask = asyncHandler(async(req,res)=>{
    const{subTaskId} = req.params;
    const{title} = req.body;
    if(!title){
        throw new ApiError(400, "Title is required")
    }
    const subTask = await Subtask.findByIdAndUpdate(
        subTaskId,
        {
            $set:{title}
        }, {new: true}
    )
    if(!subTask){
        throw new ApiError(404, "subtask not found")
    }
    return res.status(200).json(new ApiResponse(200, subTask, "subtask updated successfully"));

})
const deleteSubTask = asyncHandler(async(req,res)=>{
    const {subTaskId} = req.params;
    const subtask = await Subtask.findById(subTaskId);
    if(!subtask){
        throw new ApiError(404, "Subtask not found");
    }
    if (subtask.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the creator can delete this subtask");
    }
    const subTask = await Subtask.findByIdAndDelete(subTaskId);
    
    return res.status(200).json( new ApiResponse(200, subTask, "Subtask deleted successfully"));

})

export{
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    getSubTasks,
    createSubTask,
    updateSubTask,
    deleteSubTask
}
