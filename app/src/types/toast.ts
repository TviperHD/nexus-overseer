/**
 * Toast notification types
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // Duration in milliseconds (default: 5000)
}

