
import React, { createContext, useContext } from 'react';

// Define user roles
export type UserRole = 'leader' | 'baker';

// Define user interface
export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
}

// Create a default user for the simplified app
const DEFAULT_USER: User = { 
  id: '1', 
  name: 'Kitchen Leader', 
  role: 'leader', 
  email: 'leader@bakery.com' 
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always authenticated with the default user
  const value = {
    user: DEFAULT_USER,
    isAuthenticated: true
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
