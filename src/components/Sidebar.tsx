
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, FilePlus, FileText } from 'lucide-react';

interface SidebarProps {
  dailyCompleted: number;
  dailyTarget: number;
}

const Sidebar: React.FC<SidebarProps> = ({ dailyCompleted, dailyTarget }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dailyProgressPercentage = (dailyCompleted / dailyTarget) * 100;
  const location = useLocation();
  const navigate = useNavigate();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNewOrder = () => {
    navigate('/create-order');
  };
  
  const handleNavigation = (path: string) => {
    navigate(path);
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
          {isCollapsed ? 
            <ChevronRight size={20} /> : 
            <ChevronLeft size={20} />
          }
        </Button>
      </div>

      {/* Navigation Links */}
      <div className="p-4 flex flex-col gap-2 border-b">
        <Button 
          onClick={() => handleNavigation('/')} 
          variant={location.pathname === '/' || location.pathname === '/queue' ? 'default' : 'ghost'}
          className={cn("w-full justify-start", isCollapsed ? "p-2 justify-center" : "")}
        >
          <FilePlus className={cn("mr-2", isCollapsed ? "m-0" : "")} />
          {!isCollapsed && "Queue"}
        </Button>
        
        <Button 
          onClick={() => handleNavigation('/logs')} 
          variant={location.pathname === '/logs' ? 'default' : 'ghost'}
          className={cn("w-full justify-start", isCollapsed ? "p-2 justify-center" : "")}
        >
          <FileText className={cn("mr-2", isCollapsed ? "m-0" : "")} />
          {!isCollapsed && "Activity Logs"}
        </Button>
        
        <Button 
          onClick={handleNewOrder} 
          variant="outline"
          className={cn("w-full justify-start", isCollapsed ? "p-2 justify-center" : "")}
        >
          <FilePlus className={cn("mr-2", isCollapsed ? "m-0" : "")} />
          {!isCollapsed && "Create Order"}
        </Button>
      </div>
      
      {/* Daily progress section */}
      <div className={cn("p-4 border-t mt-auto", isCollapsed ? "px-2" : "")}>
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
