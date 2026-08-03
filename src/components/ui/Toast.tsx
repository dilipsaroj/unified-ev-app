'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
}

export function Toast({ id, message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    info: 'var(--color-info)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-danger)',
  }[type];

  return (
    <div
      className="toast-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 'var(--color-surface)',
        border: `1px solid ${bgColor}`,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        minWidth: 280,
        maxWidth: 420,
        animation: 'toast-in 0.2s ease-out',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          width: 4,
          height: 32,
          background: bgColor,
          borderRadius: 2,
        }}
      />
      <p
        style={{
          flex: 1,
          fontSize: 14,
          lineHeight: '1.5',
          color: 'var(--color-ink)',
          margin: 0,
        }}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          padding: 4,
          cursor: 'pointer',
          color: 'var(--color-ink-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Close toast"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      style={{
        position: 'absolute',
        top: 24,
        right: 16,
        left: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignItems: 'stretch',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}
