// src/App.tsx
import { AuthProvider } from "./features/auth/contexts/AuthProvider";
import { NotificationProvider } from "./contexts/NotificationProvider"; // Atualizado
import { UserDataProvider } from "./contexts/UserDataProvider";
import { AppointmentProvider } from "./features/appointments/contexts/AppointmentProvider"; // Atualizado
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <UserDataProvider>
          <AppointmentProvider>
            <AppRoutes />
          </AppointmentProvider>
        </UserDataProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}