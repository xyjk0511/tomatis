import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const toastIcons = {
  info: <AlertCircle className="text-blue-500" />,
  success: <CheckCircle className="text-green-500" />,
};

const Toast = ({ message, type = 'info', duration = 3000, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) {
          onDismiss();
        }
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div className={`fixed top-5 right-5 bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-5 fade-in-0 duration-300 z-[100]`}>
      {toastIcons[type]}
      <span className="text-sm">{message}</span>
      <button onClick={() => setVisible(false)} className="ml-4 text-gray-500 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
