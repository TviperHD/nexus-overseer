/**
 * Individual toast notification component
 */

import React from 'react';
import { useToastStore } from '../../stores/toastStore';
import type { Toast } from '../../types/toast';

interface ToastProps {
  toast: Toast;
}

/**
 * Toast notification component
 * Displays a single toast notification with appropriate styling based on type
 */
export const ToastComponent: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToastStore();

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-[#1e1e1e] border-l-2 border-l-[#4ec9b0]';
      case 'error':
        return 'bg-[#1e1e1e] border-l-2 border-l-[#f48771]';
      case 'warning':
        return 'bg-[#1e1e1e] border-l-2 border-l-[#dcdcaa]';
      case 'info':
      default:
        return 'bg-[#1e1e1e] border-l-2 border-l-[#569cd6]';
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-[#4ec9b0]';
      case 'error':
        return 'text-[#f48771]';
      case 'warning':
        return 'text-[#dcdcaa]';
      case 'info':
      default:
        return 'text-[#569cd6]';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`${getToastStyles()} border border-[#3e3e42] rounded shadow-xl backdrop-blur-sm px-3 py-2.5 min-w-[280px] max-w-[400px] flex items-center gap-2.5 text-[#cccccc] transition-all duration-200`}
      role="alert"
    >
      <div className={`flex-shrink-0 ${getIconColor()}`}>
        {getIcon()}
      </div>
      <div className="flex-1 text-sm leading-relaxed">{toast.message}</div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-[#858585] hover:text-[#cccccc] transition-colors p-0.5 rounded hover:bg-[#2d2d30]"
        aria-label="Close notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

