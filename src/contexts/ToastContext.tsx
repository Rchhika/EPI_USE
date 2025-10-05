import React, { createContext, useContext, ReactNode } from 'react';
import { useToast, ToastContainer, ToastProps } from '@/components/ui/futuristic-toast';

interface ToastContextType {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    delete: (title: string, description?: string) => void;
    create: (title: string, description?: string) => void;
    update: (title: string, description?: string) => void;
  };
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toasts, addToast, removeToast, clearToasts, toast } = useToast();

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};
