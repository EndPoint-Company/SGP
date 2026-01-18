import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { UserDataProvider } from "./contexts/UserDataProvider";

// Páginas
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Unauthorized from "./pages/Unauthorized";

import PsychologistHomePage from "./pages/psychologist/PsychologistHome";
import Appointments from "./pages/psychologist/PsychologistAppointments";
import SchedulePsychologist from "./pages/psychologist/PsychologistSchedulePage";

import StudentHomePage from "./pages/student/StudentHome";
import StudentAppointmentsPage from "./pages/student/StudentAppointments";
import ScheduleStudent from "./pages/student/ScheduleStudent";

// Guards e Utilitários de Rota Refatorados
import { ProtectedRoute } from "./routes/guards/ProtectedRoute";
import { RoleRoute } from "./routes/guards/RoleRoute";
import { RedirectAfterLogin } from "./routes/components/RedirectAfterLogin";

export default function App() {
  return (
    <UserDataProvider>
      <Routes>
        {/* --- Rotas Públicas --- */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* --- Rota de Redirecionamento Inteligente --- */}
        <Route path="/after-login" element={<RedirectAfterLogin />} />

        {/* --- Rotas Protegidas (Requer Login) --- */}
        <Route element={<ProtectedRoute />}>
          
          {/* Área do Psicólogo */}
          <Route element={<RoleRoute allowedRole="psychologist" />}>
            <Route path="/psychologist/home" element={<PsychologistHomePage />} />
            <Route path="/psychologist/appointments" element={<Appointments />} />
            <Route path="/psychologist/schedule" element={<SchedulePsychologist />} />
          </Route>

          {/* Área do Aluno */}
          <Route element={<RoleRoute allowedRole="student" />}>
            <Route path="/student/home" element={<StudentHomePage />} />
            <Route path="/student/appointments" element={<StudentAppointmentsPage />} />
            <Route path="/student/schedule" element={<ScheduleStudent />} />
          </Route>

        </Route>

        {/* Fallback para 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </UserDataProvider>
  );
}