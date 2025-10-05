import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X, Trash2, UserPlus, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'delete' | 'create' | 'update';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  delete: Trash2,
  create: UserPlus,
  update: Edit3,
};

const toastStyles = {
  success: {
    bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    glow: 'shadow-green-500/20',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  delete: {
    bg: 'bg-gradient-to-r from-red-500/20 to-pink-500/20',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
  create: {
    bg: 'bg-gradient-to-r from-green-500/20 to-teal-500/20',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    glow: 'shadow-green-500/20',
  },
  update: {
    bg: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
};

const ToastComponent: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  onClose,
  action,
}) => {
  const Icon = toastIcons[type];
  const style = toastStyles[type];

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={cn(
        "relative w-full max-w-sm mx-auto mb-4",
        "backdrop-blur-lg bg-card/90 border rounded-xl",
        "shadow-2xl",
        style.bg,
        style.border,
        style.glow
      )}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-20"
        style={{
          background: `radial-gradient(circle at center, ${style.icon.replace('text-', '')} 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative p-4">
        <div className="flex items-start space-x-3">
          {/* Icon with animation */}
          <motion.div
            className={cn("flex-shrink-0", style.icon)}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              delay: 0.1,
            }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <motion.h4
              className="text-sm font-semibold text-card-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h4>
            {description && (
              <motion.p
                className="text-xs text-muted-foreground mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {description}
              </motion.p>
            )}
          </div>

          {/* Close button */}
          {onClose && (
            <motion.button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
        </div>

        {/* Action button */}
        {action && (
          <motion.div
            className="mt-3 flex justify-end"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={action.onClick}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md",
                "bg-primary/20 text-primary hover:bg-primary/30",
                "transition-all duration-200 hover:scale-105"
              )}
            >
              {action.label}
            </button>
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-primary/30 rounded-b-xl"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastComponent
              {...toast}
              onClose={() => onRemove(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const toast = {
    success: (title: string, description?: string) => 
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) => 
      addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) => 
      addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) => 
      addToast({ type: 'info', title, description }),
    delete: (title: string, description?: string) => 
      addToast({ type: 'delete', title, description }),
    create: (title: string, description?: string) => 
      addToast({ type: 'create', title, description }),
    update: (title: string, description?: string) => 
      addToast({ type: 'update', title, description }),
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    toast,
  };
};

export default ToastComponent;
