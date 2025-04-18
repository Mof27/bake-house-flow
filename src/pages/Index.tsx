
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Direct straight to queue since we removed authentication
    navigate('/queue');
  }, [navigate]);
  
  // Show loading spinner while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
};

export default Index;
