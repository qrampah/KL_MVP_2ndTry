
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AuthContextType, ShipperProfileData, DriverProfileData } from '../types';

const AUTH_STORAGE_KEY = 'kargolineUser';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const storedUsersString = localStorage.getItem('kargolineUsersDB');
    const usersDB: User[] = storedUsersString ? JSON.parse(storedUsersString) : [];
    
    // IMPORTANT: In a real app, never store passwords like this. This is for MVP simulation only.
    const foundUser = usersDB.find(u => u.email === email); // Password check would be hashed

    if (foundUser) { // Simulate password check (pass === 'password123')
      setCurrentUser(foundUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
    } else {
      throw new Error("Invalid email or password.");
    }
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (name: string, email: string, pass: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const storedUsersString = localStorage.getItem('kargolineUsersDB');
    let usersDB: User[] = storedUsersString ? JSON.parse(storedUsersString) : [];

    if (usersDB.find(u => u.email === email)) {
      setIsLoading(false);
      throw new Error("User with this email already exists.");
    }

    const newUser: User = {
      id: Date.now().toString(), // Simple ID generation
      name,
      email,
      // pass, // DO NOT STORE PLAINTEXT PASSWORD
      role,
      profileData: role === UserRole.SHIPPER 
        ? { paymentMethods: [] } as ShipperProfileData
        : { documents: [], isAvailable: false, payoutDetails: {}, earningsHistory: [] } as DriverProfileData,
    };
    
    usersDB.push(newUser);
    localStorage.setItem('kargolineUsersDB', JSON.stringify(usersDB));
    
    // For MVP, auto-login after signup
    setCurrentUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback((): void => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const updateUserProfile = useCallback(async (updatedUser: User): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));

      // Also update in the mock "DB" of users
      const storedUsersString = localStorage.getItem('kargolineUsersDB');
      let usersDB: User[] = storedUsersString ? JSON.parse(storedUsersString) : [];
      const userIndex = usersDB.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
        usersDB[userIndex] = updatedUser;
        localStorage.setItem('kargolineUsersDB', JSON.stringify(usersDB));
      }
    } else {
      throw new Error("User not found or mismatch.");
    }
    setIsLoading(false);
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, signup, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};