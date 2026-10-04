import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import {Project} from "../models/project.models.js";
import{ ProjectNote } from "../models/note.models.js"
import {UserRolesEnum, AvailableUserRole} from "../utils/constants.js"
import mongoose from "mongoose";

const addNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { Note } = req.body;

    if (!Note) {
        throw new ApiError(400, "Note is required");
    }

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const note = await ProjectNote.create({
        project: projectId,
        createdBy: req.user._id,
        content: Note,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, note, "Note added successfully"));
});

const editnote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { Note } = req.body;

    if (!Note) {
        throw new ApiError(400, "Note is required");
    }

    const note = await ProjectNote.findById(noteId);
    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    if (note.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the creator can edit this note");
    }

    note.content = Note;
    await note.save();

    return res
        .status(200)
        .json(new ApiResponse(200, note, "Note edited successfully"));
});

const deletenote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const note = await ProjectNote.findById(noteId);
    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    if (note.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the creator can delete this note");
    }

    await note.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, note, "Note deleted successfully"));
});

export { addNote, editnote, deletenote };