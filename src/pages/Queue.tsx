
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useQueueState } from '@/hooks/useQueueState';
import { useQueueOperations } from '@/hooks/useQueueOperations';

import PendingOrdersTab from '@/components/queue/tabs/PendingOrdersTab';
import InProgressTab from '@/components/queue/tabs/InProgressTab';
import CompletedTab from '@/components/queue/tabs/CompletedTab';

const QueuePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('pending');
  
  const { mockData, setMockData } = useQueueState();
  const {
    handleQuantityChange,
    handleStartMixing,
    handleCancelTimer,
    handleMixingComplete,
    handleOvenComplete
  } = useQueueOperations(mockData, setMockData);
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (ovenNumber: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItemId) return;
    
    const draggedOrder = mockData.ovenReady.find(order => order.id === draggedItemId);
    if (!draggedOrder) return;
    
    setMockData(prev => {
      const targetOven = prev.ovens.find(oven => oven.number === ovenNumber);
      if (!targetOven) return prev;
      
      let updatedOvens;
      
      if (!targetOven.isActive) {
        updatedOvens = prev.ovens.map(oven => {
          if (oven.number === ovenNumber) {
            return {
              ...oven,
              isActive: true,
              timeRemaining: 1680,
              currentBatch: {
                id: draggedOrder.id,
                batchLabel: draggedOrder.batchLabel,
                flavor: draggedOrder.flavor,
                producedQuantity: draggedOrder.producedQuantity
              },
              batches: [
                ...oven.batches,
                {
                  id: draggedOrder.id,
                  batchLabel: draggedOrder.batchLabel,
                  flavor: draggedOrder.flavor,
                  shape: draggedOrder.shape,
                  size: draggedOrder.size,
                  producedQuantity: draggedOrder.producedQuantity
                }
              ]
            };
          }
          return oven;
        });
      } else {
        updatedOvens = prev.ovens.map(oven => {
          if (oven.number === ovenNumber) {
            return {
              ...oven,
              batches: [
                ...oven.batches,
                {
                  id: draggedOrder.id,
                  batchLabel: draggedOrder.batchLabel,
                  flavor: draggedOrder.flavor,
                  shape: draggedOrder.shape,
                  size: draggedOrder.size,
                  producedQuantity: draggedOrder.producedQuantity
                }
              ]
            };
          }
          return oven;
        });
      }
      
      return {
        ...prev,
        ovenReady: prev.ovenReady.filter(order => order.id !== draggedItemId),
        ovens: updatedOvens
      };
    });
    
    setDraggedItemId(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMockData(prev => {
        const anyActiveOvens = prev.ovens.some(oven => oven.isActive && oven.timeRemaining !== undefined);
        if (!anyActiveOvens) return prev;
        
        return {
          ...prev,
          ovens: prev.ovens.map(oven => {
            if (oven.isActive && oven.timeRemaining !== undefined) {
              const newTimeRemaining = oven.timeRemaining - 1;
              
              if (newTimeRemaining === 120) {
                toast("2 minutes left on oven timer!", {
                  description: `Oven ${oven.number} will be done soon!`,
                  duration: 5000,
                });
              }
              
              if (newTimeRemaining === 0) {
                toast.success(`Oven ${oven.number} baking complete!`, {
                  description: `Ready to be removed from oven`,
                  duration: 8000,
                });
              }
              
              return {
                ...oven,
                timeRemaining: newTimeRemaining
              };
            }
            return oven;
          })
        };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

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
              onStartMixing={(id) => handleStartMixing(id, setActiveTab)}
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
