// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/auth/Login"
import AdminDashboard from "./pages/admin/AdminDashboard"
import UserDashboard from "./pages/employee/Dashboard"
import ProtectedRoute from './components/dashboard/ProtectedRoute'
import ProjectDetails from './pages/admin/ProjectDetails'
import Employees from "./pages/admin/Employees";
import Domain from "./pages/admin/Domains";
import Assignments from './pages/admin/DocumentAssignments'
import AdminLayout from './components/layout/AdminLayout'
import EmployeeProjectDetails from './pages/employee/ProjectDetails'
import ProjectComponents from './pages/admin/ProjectComponents'
import MyTasks from './pages/employee/MyTasks'
import TaskSubmission from './pages/employee/TaskSubmission'
import PendingReviews from './pages/admin/PendingReviews'
import ReviewSubmission from './pages/admin/ReviewSubmission'


function App() {
  // const [count, setCount] = useState(0)
  console.log("App Loaded");

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >

            <Route
              index
              element={<AdminDashboard />}
            />

            <Route
              path="employees"
              element={<Employees />}
            />

            <Route
              path="domains"
              element={<Domain />}
            />

            <Route
              path="project/:id"
              element={<ProjectDetails />}
            />

            <Route
              path="project/:id/assign"
              element={<Assignments />}
            />

            <Route
              path="/admin/project/:id/components"
              element={<ProjectComponents />}
            />

            <Route
              path="reviews/:submissionId"
              element={<ReviewSubmission />}
            />

            <Route
              path="reviews"
              element={<PendingReviews />}
            />
          </Route>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="employee">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/project/:id"
            element={
              <ProtectedRoute role="employee">
                <EmployeeProjectDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/tasks"
            element={
              <ProtectedRoute role="employee">
                <MyTasks />
              </ProtectedRoute>
            }
          />


          <Route
            path="/employee/tasks/:componentId/:taskId"
            element={
              <ProtectedRoute role="employee">
                <TaskSubmission />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
