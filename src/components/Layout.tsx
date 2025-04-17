
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, LogOut, PlusCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { hasNewOrders, hasOverdueOrders, newOrdersCount, overdueOrdersCount, markNewOrdersSeen } = useNotifications();
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background flex flex-col w-full ipad-container">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b ipad-safe-area flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-bakery-primary">{title}</h1>
          
          {/* Conditional badge for overdue orders */}
          {hasOverdueOrders && (
            <Badge variant="destructive" className="ml-3 animate-pulse-light">
              {overdueOrdersCount} Overdue
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Show create order button only for kitchen leaders */}
          {user?.role === 'leader' && location.pathname !== '/create-order' && (
            <Button asChild variant="outline" size="icon" className="mr-2">
              <Link to="/create-order">
                <PlusCircle className="h-5 w-5" />
              </Link>
            </Button>
          )}
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {hasNewOrders && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {newOrdersCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 text-sm font-medium">Notifications</div>
              {hasNewOrders && (
                <DropdownMenuItem onClick={markNewOrdersSeen}>
                  <span className="text-sm">
                    {newOrdersCount} new order{newOrdersCount !== 1 ? 's' : ''}
                  </span>
                </DropdownMenuItem>
              )}
              {hasOverdueOrders && (
                <DropdownMenuItem>
                  <span className="text-sm text-destructive">
                    {overdueOrdersCount} order{overdueOrdersCount !== 1 ? 's' : ''} overdue
                  </span>
                </DropdownMenuItem>
              )}
              {!hasNewOrders && !hasOverdueOrders && (
                <div className="p-2 text-sm text-muted-foreground">
                  No new notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Theme toggle */}
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2">
                {user?.name || 'User'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                Role: {user?.role === 'leader' ? 'Kitchen Leader' : 'Baker'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto ipad-safe-area">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <p>Kitchen Display System &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;
