
import React from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const baseStyle = "p-4 mb-4 text-sm rounded-lg";
  const typeStyles = {
    success: "bg-green-700 text-green-100",
    error: "bg-red-700 text-red-100",
    info: "bg-blue-700 text-blue-100",
  };

  if (!message) return null;

  return (
    <div className={`${baseStyle} ${typeStyles[type]} flex justify-between items-center`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8"
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
