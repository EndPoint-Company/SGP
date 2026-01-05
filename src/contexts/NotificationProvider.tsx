import React, { useState, useCallback } from 'react';
import { Toast } from '../components/ui/Toast';
import { NotificationContext } from './NotificationContext';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; isVisible: boolean }>({
    message: '',
    isVisible: false,
  });

  const showToast = useCallback((message: string) => {
    setToast({ message, isVisible: true });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <Toast message={toast.message} isVisible={toast.isVisible} />
    </NotificationContext.Provider>
  );
};