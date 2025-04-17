
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roleRequired?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roleRequired }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if specific role is required
  if (roleRequired && user?.role !== roleRequired) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have the required permissions to access this page.
        </p>
        <a href="/" className="text-blue-500 hover:underline">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
