export const UserRolesEnum = {
    ADMIN :"admin",
    Project_ADMIN: "project_admin",
    MEMBER : "member",
    MANAGER: 'manager'
}

export const AvailableUserRole = Object.values(UserRolesEnum);

export const TaskStatusEnum ={
    TODO:"todo",
    IN_PROGRESS:"in_progress",
    DONE:"done"
}

export const AvailTaskStatus = Object.values(TaskStatusEnum);  