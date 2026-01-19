import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  // Adicionamos props opcionais para acessibilidade, caso queira passar textos específicos
  title?: string; 
  description?: string;
};

export function Modal({ isOpen, onClose, children, title, description }: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/30 fixed inset-0 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-auto bg-white p-6 shadow-lg rounded-xl z-50">
          
          {/* CORREÇÃO: Componentes obrigatórios de acessibilidade. 
            A classe 'sr-only' esconde visualmente mas mantém legível para screen readers.
          */}
          <Dialog.Title className="sr-only">
            {title || "Caixa de Diálogo"}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            {description || "Conteúdo da janela modal"}
          </Dialog.Description>

          {children}
          
          <Dialog.Close asChild>
            <button
              className="text-gray-400 hover:text-gray-600 absolute top-4 right-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full focus:outline-none"
              aria-label="Close"
            >
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}