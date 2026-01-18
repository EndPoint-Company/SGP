import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { UserDataProvider } from "./contexts/UserDataProvider";
import { ToastProvider } from "./contexts/ToastProvider"; // Importe o Provider

// ... outros imports de páginas ...
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Unauthorized from "./pages/Unauthorized";
import { RedirectAfterLogin } from "./routes/components/RedirectAfterLogin";
import { ProtectedRoute } from "./routes/guards/ProtectedRoute";
import { RoleRoute } from "./routes/guards/RoleRoute";

// ... imports das homes e schedules ...
import PsychologistHomePage from "./pages/psychologist/PsychologistHome";
import Appointments from "./pages/psychologist/PsychologistAppointments";
import SchedulePsychologist from "./pages/psychologist/PsychologistSchedulePage";
import StudentHomePage from "./pages/student/StudentHome";
import StudentAppointmentsPage from "./pages/student/StudentAppointments";
import ScheduleStudent from "./pages/student/ScheduleStudent";

export default function App() {
  return (
    <ToastProvider> 
      <UserDataProvider>
        <Routes>
          {/* ... rotas existentes ... */}
           <Route path="/" element={<Navigate to="/login" />} />
           <Route path="/register" element={<Register />} />
           <Route path="/login" element={<Login />} />
           <Route path="/unauthorized" element={<Unauthorized />} />
           <Route path="/after-login" element={<RedirectAfterLogin />} />

           <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allowedRole="psychologist" />}>
                <Route path="/psychologist/home" element={<PsychologistHomePage />} />
                <Route path="/psychologist/appointments" element={<Appointments />} />
                <Route path="/psychologist/schedule" element={<SchedulePsychologist />} />
              </Route>
              <Route element={<RoleRoute allowedRole="student" />}>
                <Route path="/student/home" element={<StudentHomePage />} />
                <Route path="/student/appointments" element={<StudentAppointmentsPage />} />
                <Route path="/student/schedule" element={<ScheduleStudent />} />
              </Route>
           </Route>

           <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </UserDataProvider>
    </ToastProvider>
  );
}