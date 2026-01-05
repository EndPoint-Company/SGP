import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'success';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info'
}) => {
  const icons = {
    danger: <AlertTriangle className="w-6 h-6 text-red-600" />,
    info: <Info className="w-6 h-6 text-blue-600" />,
    success: <CheckCircle className="w-6 h-6 text-green-600" />
  };

  const confirmVariants = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-red-100' : variant === 'success' ? 'bg-green-100' : 'bg-blue-100'}`}>
            {icons[variant]}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-8">{message}</p>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            onClick={() => { onConfirm(); onClose(); }}
            className={confirmVariants[variant]}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};