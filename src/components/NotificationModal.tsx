import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../useNotification';

const NotificationModal: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  const navigate = useNavigate();

  if (notifications.length === 0) return null;

  const notification = notifications[0];

  const handleClose = () => {
    removeNotification(notification.id);
  };

  const handleNavigate = () => {
    if (notification.link) {
      navigate(notification.link);
    }
    removeNotification(notification.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
        <p className="mb-4 text-gray-800">{notification.message}</p>
        <div className="flex justify-center space-x-4">
          {notification.link && (
            <button
              onClick={handleNavigate}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              View
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
