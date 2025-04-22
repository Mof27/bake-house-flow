
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
import OvenTab from '@/components/queue/tabs/OvenTab';
import CompletedTab from '@/components/queue/tabs/CompletedTab';
import { useQueueState } from '@/hooks/useQueueState';
import { useQueueOperations } from '@/hooks/useQueueOperations';
import { toast } from 'sonner';

const QueuePage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const { mockData, setMockData, fetchLatestData } = useQueueState();
  
  // Set the active tab to 'pending' when showNewest is in the query parameters
  useEffect(() => {
    const showNewest = new URLSearchParams(location.search).get('showNewest');
    if (showNewest === 'true') {
      setActiveTab('pending');
    }
  }, [location.search]);
  
  const {
    handleQuantityChange,
    handleMixingQuantityChange,
    handleStartMixing,
    handleCancelTimer,
    handleMixingComplete,
  } = useQueueOperations(mockData, setMockData);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // New handler to put back a mixing item to pending orders
  const handlePutBackToPending = (orderId: string) => {
    try {
      console.log("Putting order back to pending:", orderId);
      handleCancelTimer(orderId);
    } catch (error) {
      console.error("Error returning order to pending:", error);
      toast.error("Failed to return order to pending queue");
    }
  };

  const sidebar = (
    <Sidebar 
      dailyCompleted={mockData.dailyCompleted} 
      dailyTarget={mockData.dailyTarget} 
    />
  );

  console.log("Current Queue State - Pending Orders:", mockData.pendingOrders);
  console.log("Current Queue State - Active Mixing:", mockData.activeMixing);

  return (
    <Layout sidebar={sidebar}>
      <div className="flex flex-col h-screen">
        <Tabs 
          defaultValue="pending" 
          className="w-full h-full flex flex-col" 
          value={activeTab} 
          onValueChange={handleTabChange}
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
              onQuantityChange={handleMixingQuantityChange}
              onPutBack={handlePutBackToPending}
              onMoveToOven={handleMixingComplete}
            />

            <OvenTab
              ovenReadyBatches={mockData.ovenReady || []}
              onStartBaking={handleStartMixing}
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
