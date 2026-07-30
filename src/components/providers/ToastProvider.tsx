'use client';

import { ToastContainer } from '@/components/ui/Toast';
import { useToastState } from '@/hooks/useToast';

export function ToastProvider() {
  const { toasts, removeToast } = useToastState();
  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
}
