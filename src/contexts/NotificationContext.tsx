import { createContext, useContext } from 'react';

export interface NotificationContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification deve ser usado dentro de um NotificationProvider");
  }
  return context;
};