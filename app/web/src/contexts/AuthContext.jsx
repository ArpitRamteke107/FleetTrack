import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '../lib/pocketbaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login since Pocketbase backend is missing
    const authData = {
      record: {
        id: 'mock-user-1',
        email: email,
        name: 'Mock User',
        role: email.includes('driver') ? 'driver' : 'owner',
      }
    };
    setCurrentUser(authData.record);
    return authData;
  };

  const signup = async (email, password, name, role, phone, licenceNumber, aadharCard, licenceCopy, passportPhoto) => {
    // Mock signup since Pocketbase backend is missing
    const record = {
      id: `mock-user-${Date.now()}`,
      email,
      name,
      role,
      phone: phone || '',
      licence_number: licenceNumber || '',
      joining_date: new Date().toISOString().split('T')[0],
      aadhar_card: aadharCard ? aadharCard.name : null,
      licence_copy: licenceCopy ? licenceCopy.name : null,
      passport_photo: passportPhoto ? passportPhoto.name : null
    };
    setCurrentUser(record);
    return record;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    initialLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};