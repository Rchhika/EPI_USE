import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConfirmationType = 'delete' | 'warning' | 'danger' | 'info';

export interface ConfirmationProps {
  id: string;
  type: ConfirmationType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const confirmationStyles = {
  delete: {
    bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    glow: 'shadow-red-500/20',
    confirmBg: 'bg-red-500 hover:bg-red-600',
    iconComponent: Trash2,
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
    confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
    iconComponent: AlertTriangle,
  },
  danger: {
    bg: 'bg-gradient-to-r from-red-500/20 to-pink-500/20',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    glow: 'shadow-red-500/20',
    confirmBg: 'bg-red-500 hover:bg-red-600',
    iconComponent: AlertTriangle,
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    confirmBg: 'bg-blue-500 hover:bg-blue-600',
    iconComponent: CheckCircle,
  },
};

const ConfirmationDialog: React.FC<ConfirmationProps> = ({
  id,
  type,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const style = confirmationStyles[type];
  const Icon = style.iconComponent;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={cn(
          "relative w-full max-w-md mx-auto",
          "backdrop-blur-lg bg-card/95 border rounded-2xl",
          "shadow-2xl",
          style.bg,
          style.border,
          style.glow
        )}
      >
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${style.icon.replace('text-', '')} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start space-x-4 mb-6">
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
              <Icon className="w-8 h-8" />
            </motion.div>

            {/* Title and message */}
            <div className="flex-1 min-w-0">
              <motion.h3
                className="text-lg font-semibold text-card-foreground mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.h3>
              <motion.p
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {message}
              </motion.p>
            </div>

            {/* Close button */}
            <motion.button
              onClick={onCancel}
              className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          </div>

          {/* Actions */}
          <motion.div
            className="flex justify-end space-x-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {cancelText}
            </motion.button>
            <motion.button
              onClick={onConfirm}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-200",
                style.confirmBg
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {confirmText}
            </motion.button>
          </motion.div>
        </div>

        {/* Progress indicator */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-primary/30 rounded-b-2xl"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 10, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  );
};

// Confirmation Container
interface ConfirmationContainerProps {
  confirmations: ConfirmationProps[];
  onRemove: (id: string) => void;
}

export const ConfirmationContainer: React.FC<ConfirmationContainerProps> = ({ 
  confirmations, 
  onRemove 
}) => {
  return (
    <AnimatePresence mode="wait">
      {confirmations.map((confirmation) => (
        <ConfirmationDialog
          key={confirmation.id}
          {...confirmation}
          onConfirm={() => {
            confirmation.onConfirm();
            onRemove(confirmation.id);
          }}
          onCancel={() => {
            confirmation.onCancel();
            onRemove(confirmation.id);
          }}
        />
      ))}
    </AnimatePresence>
  );
};

// Confirmation Hook
export const useConfirmation = () => {
  const [confirmations, setConfirmations] = React.useState<ConfirmationProps[]>([]);

  const showConfirmation = React.useCallback((
    type: ConfirmationType,
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const confirmation: ConfirmationProps = {
      id,
      type,
      title,
      message,
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      onConfirm,
      onCancel: () => {}, // Will be set by container
    };
    
    setConfirmations(prev => [...prev, confirmation]);
  }, []);

  const removeConfirmation = React.useCallback((id: string) => {
    setConfirmations(prev => prev.filter(conf => conf.id !== id));
  }, []);

  // Convenience methods
  const confirm = {
    delete: (title: string, message: string, onConfirm: () => void) =>
      showConfirmation('delete', title, message, onConfirm, {
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }),
    warning: (title: string, message: string, onConfirm: () => void) =>
      showConfirmation('warning', title, message, onConfirm),
    danger: (title: string, message: string, onConfirm: () => void) =>
      showConfirmation('danger', title, message, onConfirm),
    info: (title: string, message: string, onConfirm: () => void) =>
      showConfirmation('info', title, message, onConfirm),
  };

  return {
    confirmations,
    showConfirmation,
    removeConfirmation,
    confirm,
  };
};

export default ConfirmationDialog;
