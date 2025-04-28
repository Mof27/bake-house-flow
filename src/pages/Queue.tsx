
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
import { toast } from 'sonner';
import { 
  useOrdersByStatus, 
  useDailyCompletedCount,
  useQueueRefresh
} from '@/hooks/react-query/useQueueQueries';
import { useQueueStore } from '@/stores/queueStore';
import { PendingOrder, ActiveMixing, OvenReadyBatch, CompletedBatch } from '@/types/queue';
import { ManualBakerOrder } from '@/types/orders';

// Helper function to convert ManualBakerOrder to PendingOrder
const toPendingOrder = (order: ManualBakerOrder): PendingOrder => ({
  id: order.id,
  flavor: order.flavor,
  shape: order.shape,
  size: order.size,
  batchLabel: order.batchLabel,
  requestedAt: order.createdAt,
  isPriority: order.isPriority,
  requestedQuantity: order.requestedQuantity,
  producedQuantity: order.producedQuantity,
  notes: order.notes
});

// Helper function to convert ManualBakerOrder to ActiveMixing
const toActiveMixing = (order: ManualBakerOrder): ActiveMixing => ({
  id: order.id,
  flavor: order.flavor,
  shape: order.shape,
  size: order.size,
  batchLabel: order.batchLabel,
  requestedAt: order.createdAt,
  isPriority: order.isPriority,
  startTime: order.startedAt || new Date(),
  requestedQuantity: order.requestedQuantity,
  producedQuantity: order.producedQuantity,
  notes: order.notes
});

// Helper function to convert ManualBakerOrder to OvenReadyBatch
const toOvenReadyBatch = (order: ManualBakerOrder): OvenReadyBatch => ({
  id: order.id,
  flavor: order.flavor,
  shape: order.shape,
  size: order.size,
  batchLabel: order.batchLabel,
  requestedAt: order.createdAt,
  isPriority: order.isPriority,
  requestedQuantity: order.requestedQuantity,
  producedQuantity: order.producedQuantity
});

// Helper function to convert ManualBakerOrder to CompletedBatch
const toCompletedBatch = (order: ManualBakerOrder): CompletedBatch => ({
  id: order.id,
  batchLabel: order.batchLabel,
  flavor: order.flavor,
  shape: order.shape,
  size: order.size,
  producedQuantity: order.producedQuantity,
  completedAt: order.completedAt || new Date()
});

const QueuePage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('pending');
  
  // React Query hooks
  const { data: pendingOrdersData, isLoading: isPendingLoading } = useOrdersByStatus('queued');
  const { data: mixingOrdersData, isLoading: isMixingLoading } = useOrdersByStatus('mixing');
  const { data: bakingOrdersData, isLoading: isBakingLoading } = useOrdersByStatus('baking');
  const { data: completedOrdersData, isLoading: isCompletedLoading } = useOrdersByStatus('done');
  const { data: dailyCompletedCount = 0, isLoading: isCountLoading } = useDailyCompletedCount();
  const { refresh, isRefreshing } = useQueueRefresh();
  
  // Zustand store
  const { 
    dailyTarget,
    startMixing, 
    cancelMixing, 
    completeMixing,
    updateQuantity,
    completeBaking,
    startBaking
  } = useQueueStore();
  
  // Convert API data to our UI models
  const pendingOrders: PendingOrder[] = pendingOrdersData?.map(toPendingOrder) || [];
  const activeMixing: ActiveMixing[] = mixingOrdersData?.map(toActiveMixing) || [];
  const ovenReadyBatches: OvenReadyBatch[] = bakingOrdersData?.map(toOvenReadyBatch) || [];
  const completedBatches: CompletedBatch[] = completedOrdersData?.map(toCompletedBatch) || [];
  
  // Set the active tab to 'pending' when showNewest is in the query parameters
  useEffect(() => {
    const showNewest = new URLSearchParams(location.search).get('showNewest');
    if (showNewest === 'true') {
      setActiveTab('pending');
    }
  }, [location.search]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Handler functions using our store
  const handleStartMixing = (orderId: string, mixerId: number) => {
    startMixing(orderId, mixerId);
  };
  
  const handlePutBackToPending = (orderId: string) => {
    try {
      console.log("Putting order back to pending:", orderId);
      cancelMixing(orderId);
    } catch (error) {
      console.error("Error returning order to pending:", error);
      toast.error("Failed to return order to pending queue");
    }
  };
  
  const handleMixingComplete = (orderId: string) => {
    // Extract mixer number from order
    const order = activeMixing.find(o => o.id === orderId);
    if (!order) return;
    
    const mixerMatch = order.batchLabel.match(/Mixer #(\d+)/);
    const mixerNumber = mixerMatch ? parseInt(mixerMatch[1]) : 1;
    
    completeMixing(orderId, mixerNumber);
  };
  
  const handleMixingQuantityChange = (orderId: string, delta: number) => {
    updateQuantity(orderId, delta);
  };

  const handleStartBaking = (orderId: string, ovenNumber: number) => {
    startBaking(orderId, ovenNumber);
  };

  const handleOvenComplete = (ovenNumber: number) => {
    completeBaking(ovenNumber);
  };
  
  const isLoading = isPendingLoading || isMixingLoading || isBakingLoading || isCompletedLoading || isCountLoading;
  
  const sidebar = (
    <Sidebar 
      dailyCompleted={dailyCompletedCount} 
      dailyTarget={dailyTarget}
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
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading...</p>
              </div>
            ) : (
              <>
                <PendingOrdersTab
                  pendingOrders={pendingOrders}
                  onStartMixing={handleStartMixing}
                />
                
                <MixingTab
                  activeMixing={activeMixing}
                  onCancelTimer={handlePutBackToPending}
                  onMixingComplete={handleMixingComplete}
                  onQuantityChange={handleMixingQuantityChange}
                  onPutBack={handlePutBackToPending}
                  onMoveToOven={handleMixingComplete}
                />

                <OvenTab
                  ovenReadyBatches={ovenReadyBatches}
                  onStartBaking={handleStartBaking}
                />
                
                <CompletedTab
                  completedBatches={completedBatches}
                />
              </>
            )}
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default QueuePage;
