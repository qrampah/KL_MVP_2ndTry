import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useNotification } from '../../hooks/useNotification';
import NotificationToast from './NotificationToast';
import './NotificationStyles.css';

const NotificationContainer: React.FC = () => {
    const { notifications } = useNotification();

    return (
        <div className="fixed top-5 right-5 z-50 w-80 space-y-2">
             <TransitionGroup component={null}>
                {notifications.map(notification => (
                    <CSSTransition
                        key={notification.id}
                        timeout={500}
                        classNames="toast"
                    >
                        <NotificationToast notification={notification} />
                    </CSSTransition>
                ))}
            </TransitionGroup>
        </div>
    );
};

export default NotificationContainer;