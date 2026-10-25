import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import OrganizationsPage from "./pages/OrganizationsPage.jsx";
import OrganizationPage from "./pages/OrganizationPage.jsx";
import ProjectPage from "./pages/ProjectPage.jsx";
import TaskPage from "./pages/TaskPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/organizations" element={<OrganizationsPage />} />

        <Route
          path="/organizations/:organizationId"
          element={<OrganizationPage />}
        />

        <Route path="/projects/:projectId" element={<ProjectPage />} />

        <Route path="/tasks/:taskId" element={<TaskPage />} />

        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/profile/edit" element={<EditProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
