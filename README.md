A backend project for managing projects, tasks, and teams — with role-based access control and JWT authentication.

Core Features:
1. User authentication
2. Project Management
3. Note Management
4. Task Management
5. SubTask Management
6. System Health Check

Features implemented: 

 User authentication: 
 1. Register
 2. Login
 3. Logout
 4.  Request Validation
 5. Change Password
 6. Reset Password.
 7. Access Token renew
 8. Email verification ( mailtrap + nodemailer)
Project Management:
1. create Project
2. update Project
3. add Project Member
4. role based access control
5. get Projects
6. get ProjectbyId
7. get projectmembers
8. update projectmember role
9. delete project
10. delete projectmember
Task Management:
1. create task
2. update task
3. delete task
4. getTasks
5. getTaskbyId
6. only creator of task can delete and update the task.
7. validation
SubTask Management:
1. Create subtask
2. update subtask
3. delete subtask
4. get subtask
Note Management:
1. Add Note to project
2. edit note
3. delete note

healthcheck for the system.



Tech Stack:
Node.js, Express
Database: MongoDB (Mongoose)
authentication : verify JWWT, Role based authetication
Other packages: multer, mailtrap , nodemailer
