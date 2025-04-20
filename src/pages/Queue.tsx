
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import PendingOrdersTab from '@/components/queue/tabs/PendingOrdersTab';
import MixingTab from '@/components/queue/tabs/MixingTab';
import CompletedTab from '@/components/queue/tabs/CompletedTab';
import { useQueueState } from '@/hooks/useQueueState';
import { useQueueOperations } from '@/hooks/useQueueOperations';

const QueuePage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const { mockData, setMockData } = useQueueState();
  
  // Set the active tab to 'pending' when showNewest is in the query parameters
  useEffect(() => {
    const showNewest = new URLSearchParams(location.search).get('showNewest');
    if (showNewest === 'true') {
      setActiveTab('pending');
    }
  }, [location.search]);
  
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
              <TabsTrigger value="mixing" className="font-bold">MIXING</TabsTrigger>
              <TabsTrigger value="oven" className="font-bold">OVEN</TabsTrigger>
              <TabsTrigger value="done" className="font-bold">DONE</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <PendingOrdersTab
              pendingOrders={mockData.pendingOrders}
              onStartMixing={handleStartMixing}
            />
            
            <MixingTab
              activeMixing={mockData.activeMixing}
              onCancelTimer={handleCancelTimer}
              onMixingComplete={handleMixingComplete}
              onQuantityChange={handleQuantityChange}
              onMoveToOven={handleMixingComplete}
            />

            <OvenTab
              ovenReadyBatches={mockData.ovenReady}
              onStartBaking={handleMixingComplete}
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
