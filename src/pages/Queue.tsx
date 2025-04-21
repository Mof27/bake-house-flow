
import React, { useState, useEffect, useRef } from 'react';
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
import { PendingOrder } from '@/types/queue';

const QueuePage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const { mockData, setMockData } = useQueueState();
  const lastTabState = useRef<Record<string, any>>({});
  
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

  // Save the current card state whenever we switch tabs or refresh
  const handleTabChange = (value: string) => {
    // Save current tab state to prevent items from jumping around
    if (activeTab) {
      if (activeTab === 'mixing') {
        lastTabState.current.mixing = [...mockData.activeMixing];
      } else if (activeTab === 'pending') {
        lastTabState.current.pending = [...mockData.pendingOrders];
      } else if (activeTab === 'oven') {
        lastTabState.current.oven = [...mockData.ovenReady];
      }
    }
    
    setActiveTab(value);
  };

  // New handler to put back a mixing item to pending orders
  const handlePutBackToPending = (orderId: string) => {
    setMockData((prev) => {
      // Find item in activeMixing based on orderId
      const itemToPutBack = prev.activeMixing.find(item => item.id === orderId);
      if (!itemToPutBack) return prev;

      // Remove from activeMixing
      const newActiveMixing = prev.activeMixing.filter(item => item.id !== orderId);

      // Convert ActiveMixing item to PendingOrder item
      const pendingOrderItem: PendingOrder = {
        id: itemToPutBack.id,
        flavor: itemToPutBack.flavor,
        shape: itemToPutBack.shape,
        size: itemToPutBack.size,
        batchLabel: itemToPutBack.batchLabel.replace(/ \(Mixer #[1-2]\)/, ''), // Remove the mixer number
        requestedAt: itemToPutBack.requestedAt,
        isPriority: itemToPutBack.isPriority,
        requestedQuantity: itemToPutBack.requestedQuantity || 5, // Default value if not present
        producedQuantity: itemToPutBack.producedQuantity || itemToPutBack.requestedQuantity || 5, // Default value if not present
        notes: itemToPutBack.notes
      };

      // Add back to pendingOrders, preserving any order (added at start to be recent)
      const newPendingOrders = [pendingOrderItem, ...prev.pendingOrders];

      return {
        ...prev,
        activeMixing: newActiveMixing,
        pendingOrders: newPendingOrders,
      };
    });
  };

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
