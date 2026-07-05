# Timely AI

A full-stack AI-powered Task & Project Management System built using the MERN stack.

Timely AI is designed to manage projects, automatically assign employees based on their expertise, track task submissions with version history, and provide an approval workflow for administrators.

---

## Features

### Authentication
- JWT Authentication
- Role-based access
- Admin & Employee dashboards

### Employee Management
- Create employees
- Domain-based employee management
- Employee assignment tracking

### Domain Management
- Create domains
- Assign employees to domains

### Project Management
- Create projects
- Assign domains
- Manage project team
- Project status tracking

### Project Structure
- Project Modules
- Project Components
- Component Templates
- Task Templates

### Task Assignment
- Assign employees to tasks
- Deadlines
- Task status

### Submission Workflow
- Text submissions
- Version history
- Review system
- Approve / Reject workflow
- Review remarks

### Dashboard
Admin Dashboard
- Projects
- Employees
- Pending Reviews
- Assignments

Employee Dashboard
- Assigned Projects
- Assigned Tasks
- Submit Work

---

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Shadcn UI
- Axios
- React Router DOM

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer (Upcoming)

### Database

MongoDB Atlas

### Deployment

Frontend
- Vercel

Backend
- Render

---

## Project Structure

```
Repository
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── utils
│   │   ├── config
│   │   └── app.js
│   │
│   ├── package.json
│   └── server.js
│
├── timely
│   ├── src
│   │   ├── api
│   │   ├── assets
│   │   ├── components
│   │   ├── pages
│   │   │   ├── admin
│   │   │   ├── employee
│   │   │   └── auth
│   │   ├── services
│   │   ├── hooks
│   │   ├── utils
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/<username>/timely-ai.git

cd timely-ai
```

---

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

Create a `.env`

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

CLIENT_URL=http://localhost:5173
```

---

## Frontend Setup

```bash
cd timely

npm install

npm run dev
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Deployment

### Backend

Hosted on Render

Required Environment Variables

```env
PORT

MONGO_URI

JWT_SECRET

CLIENT_URL
```

---

### Frontend

Hosted on Vercel

Environment Variables

```env
VITE_API_URL
```

---

## Current Workflow

```
Admin

Create Domain
      │
Create Employee
      │
Create Project
      │
Assign Domain
      │
Create Modules
      │
Create Components
      │
Assign Tasks
      │
Employee Submission
      │
Admin Review
      │
Approve / Reject
```

---

## Upcoming Features

- Document Upload
- PDF Submission
- Image Submission
- ZIP Upload
- Multiple File Upload
- AI Document Review
- AI Task Suggestions
- Notifications
- Email Alerts
- Activity Timeline
- Analytics Dashboard
- Search & Filters
- Audit Logs

---

## Future Improvements

- Docker Support
- CI/CD Pipeline
- Unit Testing
- Integration Testing
- Redis Cache
- WebSockets
- File Storage (AWS S3)
- Kubernetes Deployment
- Role & Permission System

---

## Author

**Abhishek Gwari**

MERN Stack Developer

GitHub:
https://github.com/<your-github>

LinkedIn:
https://linkedin.com/in/<your-linkedin>

---