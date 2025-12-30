/**
 * Toast container component
 * Renders all active toast notifications
 */

import React from 'react';
import { useToastStore } from '../../stores/toastStore';
import { ToastComponent } from './Toast';

/**
 * Toast container component
 * Displays all active toast notifications in a fixed position
 */
export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-3 right-3 z-50 flex flex-col gap-1.5 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto transition-all duration-200 ease-out">
          <ToastComponent toast={toast} />
        </div>
      ))}
    </div>
  );
};

