// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/employee/Dashboard";
import ProtectedRoute from "./components/dashboard/ProtectedRoute";
import ProjectDetails from "./pages/admin/ProjectDetails";
import Employees from "./pages/admin/Employees";
import Domain from "./pages/admin/Domains";
import Assignments from "./pages/admin/DocumentAssignments";
import AdminLayout from "./components/layout/AdminLayout";
import EmployeeLayout from "./components/layout/EmployeeLayout";
import EmployeeProjectDetails from "./pages/employee/ProjectDetails";
import ProjectComponents from "./pages/admin/ProjectComponents";
import MyTasks from "./pages/employee/MyTasks";
import TaskSubmission from "./pages/employee/TaskSubmission";
import EmployeeUpdates from "./pages/employee/Updates";
import PendingReviews from "./pages/admin/PendingReviews";
import WorkspaceManagement from "./pages/admin/WorkspaceManagement";
import EmployeeDetails from "./pages/admin/EmployeeDetails";
import DomainDetails from "./pages/admin/DomainDetails";
import EmployeeProjectTasks from "./pages/admin/EmployeeProjectTasks";
import ProjectDomainTasks from "./pages/admin/ProjectDomainTasks";
import AdminTaskDetails from "./pages/admin/AdminTaskDetails";
import AdminEmployeeUpdates from "./pages/admin/EmployeeUpdates";

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
            <Route index element={<AdminDashboard />} />

            <Route path="employees" element={<Employees />} />

            <Route path="domains" element={<Domain />} />

            <Route path="project/:id" element={<ProjectDetails />} />

            <Route path="project/:id/assign" element={<Assignments />} />

            <Route
              path="/admin/project/:id/components"
              element={<ProjectComponents />}
            />

            {/* Both routes resolve to the same unified Task Details page */}
            <Route
              path="reviews/:submissionId"
              element={<AdminTaskDetails />}
            />

            <Route
              path="tasks/:componentId/:taskId"
              element={<AdminTaskDetails />}
            />

            <Route path="reviews" element={<PendingReviews />} />

            <Route path="projects" element={<AdminDashboard />} />

            <Route path="workspace" element={<WorkspaceManagement />} />

            <Route path="updates" element={<AdminEmployeeUpdates />} />

            <Route path="employees/:id" element={<EmployeeDetails />} />

            <Route path="domains/:id" element={<DomainDetails />} />

            <Route
              path="project/:projectId/employees/:employeeId/tasks"
              element={<EmployeeProjectTasks />}
            />

            <Route
              path="project/:projectId/domains/:domainId/tasks"
              element={<ProjectDomainTasks />}
            />

            {/* <Route
              path="tasks/:componentId/:taskId"
              element={<AdminTaskDetails />}
            /> */}
          </Route>

          <Route
            element={
              <ProtectedRoute role="employee">
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<UserDashboard />} />

            <Route
              path="/dashboard/project/:id"
              element={<EmployeeProjectDetails />}
            />

            <Route path="/employee/tasks" element={<MyTasks />} />

            <Route path="/employee/tasks/:projectId" element={<MyTasks />} />

            <Route
              path="/employee/tasks/:componentId/:taskId"
              element={<TaskSubmission />}
            />

            <Route path="/employee/updates" element={<EmployeeUpdates />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
