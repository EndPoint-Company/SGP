// src/features/appointments/hooks/useAppointments.ts

import { useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useAppointmentsContext } from "../contexts/AppointmentContextDefinition";

export function useAppointments() {
  const { user, role } = useAuth();
  const { appointments, isLoading, fetchAppointments, ...actions } =
    useAppointmentsContext();

  useEffect(() => {
    if (user?.uid && (role === "student" || role === "psychologist")) {
      fetchAppointments(user.uid, role);
    }
  }, [user?.uid, role, fetchAppointments]);

  return {
    appointments,
    isLoading,
    ...actions,
  };
}
