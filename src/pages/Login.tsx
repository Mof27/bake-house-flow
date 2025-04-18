
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Since we've removed login functionality, we'll just redirect to home page
  // if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background ipad-container">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-bakery-primary">Baker KDS</h1>
          <p className="text-muted-foreground mt-2">Kitchen Display System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Kitchen Display System</CardTitle>
            <CardDescription>
              Welcome to the Baker KDS, focused on queue management
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Login functionality has been removed to focus on queue operations.</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full h-12 text-lg"
            >
              Enter Application
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
