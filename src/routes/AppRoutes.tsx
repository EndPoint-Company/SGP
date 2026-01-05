import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Páginas
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/Unauthorized";
import PsychologistHomePage from "../pages/psychologist/PsychologistHome";
import PsychologistSchedulePage from "../pages/psychologist/PsychologistSchedulePage";
import StudentHomePage from "../pages/student/StudentHome";
import ScheduleStudent from "../pages/student/ScheduleStudent";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Rotas Privadas: Psicólogos */}
      <Route element={<ProtectedRoute allowedRoles={['psychologist']} />}>
        <Route path="/psychologist/home" element={<PsychologistHomePage />} />
        <Route path="/psychologist/schedule" element={<PsychologistSchedulePage />} />
      </Route>

      {/* Rotas Privadas: Alunos */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student/home" element={<StudentHomePage />} />
        <Route path="/student/schedule" element={<ScheduleStudent />} />
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}