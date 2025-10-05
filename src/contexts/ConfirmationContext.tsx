import React, { createContext, useContext, ReactNode } from 'react';
import { useConfirmation, ConfirmationContainer, ConfirmationProps } from '@/components/ui/futuristic-confirmation';

interface ConfirmationContextType {
  confirm: {
    delete: (title: string, message: string, onConfirm: () => void) => void;
    warning: (title: string, message: string, onConfirm: () => void) => void;
    danger: (title: string, message: string, onConfirm: () => void) => void;
    info: (title: string, message: string, onConfirm: () => void) => void;
  };
  showConfirmation: (
    type: 'delete' | 'warning' | 'danger' | 'info',
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string }
  ) => void;
  removeConfirmation: (id: string) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const useConfirmationContext = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmationContext must be used within a ConfirmationProvider');
  }
  return context;
};

interface ConfirmationProviderProps {
  children: ReactNode;
}

export const ConfirmationProvider: React.FC<ConfirmationProviderProps> = ({ children }) => {
  const { confirmations, showConfirmation, removeConfirmation, confirm } = useConfirmation();

  return (
    <ConfirmationContext.Provider value={{ confirm, showConfirmation, removeConfirmation }}>
      {children}
      <ConfirmationContainer confirmations={confirmations} onRemove={removeConfirmation} />
    </ConfirmationContext.Provider>
  );
};
