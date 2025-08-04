import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Notification, NotificationContextType } from '../types';

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let idCounter = 0;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((message: string, type: 'info' | 'success' | 'error', link?: string) => {
        const newNotification: Notification = {
            id: idCounter++,
            message,
            type,
            link,
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};