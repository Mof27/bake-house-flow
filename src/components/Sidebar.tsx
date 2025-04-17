
import React, { useState } from 'react';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SidebarProps {
  dailyCompleted: number;
  dailyTarget: number;
}

const Sidebar: React.FC<SidebarProps> = ({ dailyCompleted, dailyTarget }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dailyProgressPercentage = (dailyCompleted / dailyTarget) * 100;

  return (
    <div 
      className={cn(
        "bg-background border-r transition-all duration-300 flex flex-col",
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
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-full"
        >
          {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </Button>
      </div>

      <div className="flex-1 p-4">
        {!isCollapsed && (
          <>
            <h3 className="text-lg font-bold mb-2">Oven Slots</h3>
            {/* Oven slots will be rendered by the parent component */}
          </>
        )}
      </div>

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
