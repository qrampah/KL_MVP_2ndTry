import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../hooks/useNotification';
import { Notification } from '../../types';

interface NotificationToastProps {
    notification: Notification;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
    const { removeNotification } = useNotification();
    const navigate = useNavigate();

    const handleRemove = useCallback(() => {
        removeNotification(notification.id);
    }, [notification.id, removeNotification]);

    useEffect(() => {
        const timer = setTimeout(handleRemove, 5000); // Auto-dismiss after 5 seconds
        return () => clearTimeout(timer);
    }, [handleRemove]);

    const handleClick = () => {
        if (notification.link) {
            navigate(notification.link);
        }
        handleRemove();
    };

    const typeStyles = {
        success: 'bg-green-600 text-green-100',
        error: 'bg-red-600 text-red-100',
        info: 'bg-blue-600 text-blue-100',
    };

    const Icon = () => {
      switch (notification.type) {
        case 'success': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'error': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'info': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      }
      return null;
    }

    return (
        <div 
          onClick={handleClick}
          className={`${typeStyles[notification.type]} p-4 rounded-lg shadow-lg flex items-start gap-3 cursor-pointer`}
        >
          <div className="flex-shrink-0">
            <Icon />
          </div>
          <p className="text-sm font-medium flex-grow">{notification.message}</p>
          <button onClick={(e) => { e.stopPropagation(); handleRemove(); }} className="-mt-1 -mr-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
    );
};

export default NotificationToast;