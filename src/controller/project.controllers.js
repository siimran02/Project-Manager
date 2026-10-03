import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import {Project} from "../models/project.models.js";
import{ProjectMember} from "../models/projectmember.models.js"
import {UserRolesEnum, AvailableUserRole} from "../utils/constants.js"
import mongoose from "mongoose"

const createProject = asyncHandler(async(req,res)=>{
    const{ name, description } = req.body
    const project = await Project.create({
        name,
        description,
        createdBy : new mongoose.Types.ObjectId(req.user._id)
    });

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: project._id,
        role: UserRolesEnum.ADMIN
    })
    return res.status(201).json(new ApiResponse(201, project, "Project created successfully"))
})

const updateProject = asyncHandler (async(req, res)=>{
    const{projectId} = req.params
    const {name, description} = req.body;
    if(!name || !description){
        throw new ApiError(400, "Name and description are required to updated a project");
    }
    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description
        }, {new: true}
    );
    if(!updatedProject){
        throw new ApiError(404, "No project found")
    }
    return res.status(200).json(new ApiResponse(200, updatedProject, "Project updated successfully"))
});

const deleteProject = asyncHandler(async(req,res)=>{
    const {projectId} = req.params;
    const project = await Project.findByIdAndDelete(projectId);
    if(!project){
        throw new ApiError(404,"No project found");
    }
    return res.status(200).json(new ApiResponse(200, project, "project successfully deleted"))
})

const getProjects = asyncHandler(async(req,res)=>{
    const projects = await ProjectMember.aggregate(
        [
         { 
            $match:{
                user: new mongoose.Types.ObjectId(req.user._id)
            },
        },
        {
            $lookup:{
                from:"projects",
                localField:"project",
                foreignField:"_id",
                as: "project",
                pipeline:[
                    {
                        $lookup:{
                            from:"projectmembers",
                            localField: "_id",
                            foreignField:"project",
                            as:"projectmembers"
                        }
                    },
                    {
                        $addFields:{
                            members:{
                                $size: "$projectmembers",
                            }
                        }
                    }
                ]
            },
        },
        {
            $unwind: "$project"
        },
        { $sort: { "project.createdAt": -1 } },
        {
            $project:{
                project:{
                    _id:1,
                    name:1,
                    description:1,
                    members:1,
                    createdAt: 1,
                    createdBy: 1
                },
                role: 1,
                _id: 0
            }
        }
    ]
    )
    return res.status(200).json(new ApiResponse(200,projects, "project fetch successfully"))
})
const getProjectById = asyncHandler(async(req,res)=>{
    const {projectId} = req.params;
    const project = await Project.findById(projectId);
    if(!project){
        throw new ApiError(404, "No project found");
    }
    return res.status(200).json(new ApiResponse(200, project, "Project fetch successfully"));
})
const addMembersToProject = asyncHandler(async(req,res)=>{
    const { email, role }= req.body;
    const{projectId} = req.params;
    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

   const project = await ProjectMember.findOneAndUpdate(
    {
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId)
    },
    {
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId),
        role : role 
    },
    {
        new:true,
        upsert: true
    }
   ) 

   return res.status(201).json(new ApiResponse(201,project, "Project member added successfully"))
})

const getProjectMembers = asyncHandler(async(req,res)=>{
    const {projectId} = req.params;
    const project = await Project.findById(projectId);

    if(!project){
        throw new ApiError(404, "project not found")
    }
    const projectMembers = await ProjectMember.aggregate([
        {
            $match:{
                project: new mongoose.Types.ObjectId(projectId)
            }
        }, 
        {
            $lookup:{
                from: "users",
                localField: "user",
                foreignField: "_id",
                as:"user",
                pipeline:[
                    {
                        $project:{
                            _id: 1,
                            username : 1,
                            fullname : 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                user:{
                    $arrayElemAt : ["$user", 0]
                }
            }
        }, 
        {
            $project:{
                project: 1, 
                user:1,
                role:1,
                createdAt:1,
                updatedAt:1,
                _id:0,
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, projectMembers, "Project members fetched"))
}),

updateMemberRole = asyncHandler(async(req,res)=>{
    const{projectId, userId} = req.params;
    const{newRole}= req.body;
    if(!AvailableUserRole.includes(newRole)){
        throw new ApiError(400, 'Invalid Role')
    }
  
    const projectMember = await ProjectMember.findOneAndUpdate(
        {
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(userId)
        },
        {
            role: newRole
        }, 
        {
            new:true
        }
    )
    if(!projectMember){
        throw new ApiError(400, 'No projectMember found')
    }
    return res.status(200).json(new ApiResponse(200, projectMember, "Project member role updated successfully"))

})

const deleteMember = asyncHandler(async(req, res)=>{
    const{projectId, userId} = req.params;
    const projectMember = await ProjectMember.findOneAndDelete({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId)
    })
    if(!projectMember){
        throw new ApiError(404, "No project member found");
    }
    return res.status(200).json(new ApiResponse(200, projectMember, "Projectmember deleted"))
})



export{
    createProject,
    updateProject,
    deleteProject,
    getProjects,
    getProjectById,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember 
}