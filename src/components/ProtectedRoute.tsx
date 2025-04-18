
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Simplified to just render children directly since we removed authentication
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRoute;
