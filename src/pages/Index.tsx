
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // If authenticated, go to dashboard, otherwise go to login
    navigate(isAuthenticated ? '/' : '/login');
  }, [isAuthenticated, navigate]);
  
  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
};

export default Index;
