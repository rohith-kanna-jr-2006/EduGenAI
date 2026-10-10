import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message) => addToast({ message, type: 'success' });
  const error = (message) => addToast({ message, type: 'error' });
  const warning = (message) => addToast({ message, type: 'warning' });
  const info = (message) => addToast({ message, type: 'info' });

  return (
    <NotificationContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-white border-border text-ink-heading';
          let IconComp = Info;
          let iconColor = 'text-brand';

          if (toast.type === 'success') {
            bg = 'bg-status-success-bg border-status-success-border text-ink-heading';
            IconComp = CheckCircle2;
            iconColor = 'text-status-success';
          } else if (toast.type === 'error') {
            bg = 'bg-status-danger-bg border-status-danger-border text-ink-heading';
            IconComp = AlertCircle;
            iconColor = 'text-status-danger';
          } else if (toast.type === 'warning') {
            bg = 'bg-status-warning-bg border-status-warning-border text-ink-heading';
            IconComp = AlertCircle;
            iconColor = 'text-status-warning';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-level-2 animate-fade-in ${bg}`}
            >
              <IconComp className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium leading-5">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-ink-muted hover:text-ink-heading p-0.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
