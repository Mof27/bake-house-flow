
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: User[] = [
  { id: '1', name: 'Kitchen Leader', role: 'leader', email: 'leader@bakery.com' },
  { id: '2', name: 'Baker One', role: 'baker', email: 'baker1@bakery.com' },
  { id: '3', name: 'Baker Two', role: 'baker', email: 'baker2@bakery.com' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('kds-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login functionality
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = MOCK_USERS.find(u => u.email === email);
    
    if (mockUser && password === 'password') { // Demo password is 'password' for all users
      setUser(mockUser);
      localStorage.setItem('kds-user', JSON.stringify(mockUser));
      toast.success(`Welcome, ${mockUser.name}!`);
      navigate('/');
    } else {
      toast.error('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kds-user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
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

// Comment: In a production app, this would connect to a backend API for authentication
// and user management, including proper JWT token handling and secure password storage.
