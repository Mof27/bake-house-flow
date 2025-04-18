import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useQueueState } from '@/hooks/useQueueState';
import { useQueueOperations } from '@/hooks/useQueueOperations';
import { useQueueDragDrop } from '@/hooks/useQueueDragDrop';
import { useQueueTimer } from '@/hooks/useQueueTimer';

import PendingOrdersTab from '@/components/queue/tabs/PendingOrdersTab';
import InProgressTab from '@/components/queue/tabs/InProgressTab';
import CompletedTab from '@/components/queue/tabs/CompletedTab';

const QueuePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const { mockData, setMockData } = useQueueState();
  
  const {
    handleQuantityChange,
    handleStartMixing,
    handleCancelTimer,
    handleMixingComplete,
    handleOvenComplete
  } = useQueueOperations(mockData, setMockData);
  
  const {
    handleDragStart,
    handleDragOver,
    handleDrop
  } = useQueueDragDrop(mockData, setMockData);
  
  useQueueTimer(setMockData);

  const sidebar = (
    <Sidebar 
      dailyCompleted={mockData.dailyCompleted} 
      dailyTarget={mockData.dailyTarget} 
    />
  );

  return (
    <Layout sidebar={sidebar}>
      <div className="p-4 h-[calc(100vh-0px)]">
        <Tabs 
          defaultValue="pending" 
          className="w-full h-full" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList className="w-fit">
              <TabsTrigger value="pending" className="font-bold">PENDING</TabsTrigger>
              <TabsTrigger value="in-progress" className="font-bold">IN PROGRESS</TabsTrigger>
              <TabsTrigger value="done" className="font-bold">DONE</TabsTrigger>
            </TabsList>
            
            <Button size="icon" variant="ghost" className="rounded-full" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
          </div>

          <div className="h-[calc(100vh-60px)] overflow-hidden">
            <PendingOrdersTab
              pendingOrders={mockData.pendingOrders}
              onStartMixing={handleStartMixing}
            />
            
            <InProgressTab
              activeMixing={mockData.activeMixing}
              ovenReady={mockData.ovenReady}
              ovens={mockData.ovens}
              onCancelTimer={handleCancelTimer}
              onMixingComplete={handleMixingComplete}
              onQuantityChange={handleQuantityChange}
              onDragStart={handleDragStart}
              onOvenDragOver={handleDragOver}
              onOvenDrop={handleDrop}
              onOvenComplete={(ovenNumber) => handleOvenComplete(ovenNumber, activeTab, setActiveTab)}
            />
            
            <CompletedTab
              completedBatches={mockData.completedBatches}
            />
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default QueuePage;
