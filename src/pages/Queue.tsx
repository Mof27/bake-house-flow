
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import PendingOrdersTab from '@/components/queue/tabs/PendingOrdersTab';
import InProgressTab from '@/components/queue/tabs/InProgressTab';
import CompletedTab from '@/components/queue/tabs/CompletedTab';
import { useQueueState } from '@/hooks/useQueueState';
import { useQueueOperations } from '@/hooks/useQueueOperations';

const QueuePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const { mockData, setMockData } = useQueueState();
  
  const {
    handleQuantityChange,
    handleStartMixing,
    handleCancelTimer,
    handleMixingComplete,
  } = useQueueOperations(mockData, setMockData);

  const sidebar = (
    <Sidebar 
      dailyCompleted={mockData.dailyCompleted} 
      dailyTarget={mockData.dailyTarget} 
    />
  );

  return (
    <Layout sidebar={sidebar}>
      <div className="flex flex-col h-screen">
        <Tabs 
          defaultValue="pending" 
          className="w-full h-full flex flex-col" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <TabsList className="w-fit">
              <TabsTrigger value="pending" className="font-bold">PENDING</TabsTrigger>
              <TabsTrigger value="in-progress" className="font-bold">IN PROGRESS</TabsTrigger>
              <TabsTrigger value="done" className="font-bold">DONE</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <PendingOrdersTab
              pendingOrders={mockData.pendingOrders}
              onStartMixing={handleStartMixing}
            />
            
            <InProgressTab
              activeMixing={mockData.activeMixing}
              ovenReady={mockData.ovenReady}
              onCancelTimer={handleCancelTimer}
              onMixingComplete={handleMixingComplete}
              onQuantityChange={handleQuantityChange}
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
