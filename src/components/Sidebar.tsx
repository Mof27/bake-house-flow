
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  PanelLeft, 
  PanelLeftClose, 
  LogOut, 
  Bell,
  PlusCircle 
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  dailyCompleted: number;
  dailyTarget: number;
}

const Sidebar: React.FC<SidebarProps> = ({ dailyCompleted, dailyTarget }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dailyProgressPercentage = (dailyCompleted / dailyTarget) * 100;
  const { user, logout } = useAuth();
  const { hasNewOrders, hasOverdueOrders, newOrdersCount, overdueOrdersCount, markNewOrdersSeen } = useNotifications();
  const location = useLocation();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={cn(
        "bg-background border-r transition-all duration-300 flex flex-col h-screen",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className={cn("font-bold text-xl transition-opacity", 
          isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
          Queue
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse}
          className="rounded-full z-50"
        >
          {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </Button>
      </div>

      {/* User and notifications section */}
      {!isCollapsed && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {user?.name || 'User'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem disabled>
                  Role: {user?.role === 'leader' ? 'Kitchen Leader' : 'Baker'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
          </div>

          {/* Create order button for kitchen leaders */}
          {user?.role === 'leader' && location.pathname !== '/create-order' && (
            <Button asChild variant="default" className="w-full mb-2">
              <Link to="/create-order">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Order
              </Link>
            </Button>
          )}

          {/* Conditional badge for overdue orders */}
          {hasOverdueOrders && (
            <Badge variant="destructive" className="w-full justify-center animate-pulse-light">
              {overdueOrdersCount} Overdue
            </Badge>
          )}
        </div>
      )}
      
      {/* Empty space - oven slots moved to in-progress tab */}
      <div className="flex-1"></div>
      
      {/* Daily progress section */}
      <div className={cn("p-4 border-t", isCollapsed ? "px-2" : "")}>
        {!isCollapsed && (
          <div className="text-sm font-medium text-muted-foreground mb-1">Daily Progress</div>
        )}
        <div className={cn("flex justify-between items-center text-xs mb-1", 
          isCollapsed ? "flex-col" : "")}>
          {!isCollapsed ? (
            <>
              <span>{dailyCompleted} batches</span>
              <span>Target: {dailyTarget}</span>
            </>
          ) : (
            <span className="mb-1">{dailyCompleted}/{dailyTarget}</span>
          )}
        </div>
        <Progress value={dailyProgressPercentage} className={cn("h-2", isCollapsed ? "w-12" : "")} />
      </div>
    </div>
  );
};

export default Sidebar;
