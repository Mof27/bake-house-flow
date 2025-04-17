
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Moon,
  Sun,
} from 'lucide-react';
import { useOrders } from '@/contexts/OrderContext';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MockData } from '@/types/queue';

// Import our custom components
import MixingCard from '@/components/queue/MixingCard';
import ActiveMixingCard from '@/components/queue/ActiveMixingCard';
import OvenReadyCard from '@/components/queue/OvenReadyCard';
import OvenSlot from '@/components/queue/OvenSlot';
import CompletedBatchItem from '@/components/queue/CompletedBatchItem';
import ScrollableCardSection from '@/components/queue/ScrollableCardSection';

const QueuePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('pending');
  
  const generateRequestDate = () => {
    const now = new Date();
    const hoursAgo = Math.random() * 5;
    now.setHours(now.getHours() - hoursAgo);
    return now;
  };
  
  const [mockData, setMockData] = useState<MockData>({
    dailyCompleted: 12,
    dailyTarget: 20,
    pendingOrders: [
      {
        id: '1',
        flavor: 'vanilla',
        shape: 'round',
        size: 16,
        batchLabel: 'ROUND VANILLA 16CM',
        requestedQuantity: 4,
        producedQuantity: 4,
        requestedAt: generateRequestDate(),
        isPriority: true,
        notes: 'Birthday cake for Sarah'
      },
      {
        id: '2',
        flavor: 'chocolate',
        shape: 'square',
        size: 20,
        batchLabel: 'SQUARE CHOCOLATE 20CM',
        requestedQuantity: 2,
        producedQuantity: 2,
        requestedAt: generateRequestDate(),
        isPriority: false
      },
      {
        id: '6',
        flavor: 'vanilla',
        shape: 'square',
        size: 18,
        batchLabel: 'SQUARE VANILLA 18CM',
        requestedQuantity: 3,
        producedQuantity: 3,
        requestedAt: generateRequestDate(),
        isPriority: false
      },
      {
        id: '7',
        flavor: 'chocolate',
        shape: 'round',
        size: 20,
        batchLabel: 'ROUND CHOCOLATE 20CM',
        requestedQuantity: 5,
        producedQuantity: 5,
        requestedAt: generateRequestDate(),
        isPriority: true
      }
    ],
    activeMixing: [
      {
        id: '3',
        flavor: 'vanilla',
        shape: 'round',
        size: 18,
        batchLabel: 'ROUND VANILLA 18CM',
        requestedAt: generateRequestDate(),
        isPriority: false,
        startTime: new Date()
      }
    ],
    ovenReady: [
      {
        id: '4',
        flavor: 'chocolate',
        shape: 'round',
        size: 22,
        batchLabel: 'ROUND CHOCOLATE 22CM',
        requestedQuantity: 5,
        producedQuantity: 5,
        requestedAt: generateRequestDate(),
        isPriority: true
      },
      {
        id: '8',
        flavor: 'vanilla',
        shape: 'square',
        size: 16,
        batchLabel: 'SQUARE VANILLA 16CM',
        requestedQuantity: 2,
        producedQuantity: 2,
        requestedAt: generateRequestDate(),
        isPriority: false
      }
    ],
    ovens: [
      {
        number: 1,
        isActive: true,
        timeRemaining: 1250,
        currentBatch: {
          id: '5',
          batchLabel: 'ROUND VANILLA 18CM',
          flavor: 'vanilla',
          producedQuantity: 3
        },
        batches: [
          {
            id: '5',
            batchLabel: 'ROUND VANILLA 18CM',
            flavor: 'vanilla',
            shape: 'round',
            size: 18,
            producedQuantity: 3
          }
        ]
      },
      {
        number: 2,
        isActive: false,
        batches: []
      }
    ],
    completedBatches: [
      {
        id: '10',
        batchLabel: 'SQUARE VANILLA 20CM',
        flavor: 'vanilla',
        shape: 'square',
        size: 20,
        producedQuantity: 4,
        completedAt: generateRequestDate()
      },
      {
        id: '11',
        batchLabel: 'ROUND CHOCOLATE 18CM',
        flavor: 'chocolate',
        shape: 'round',
        size: 18,
        producedQuantity: 3,
        completedAt: generateRequestDate()
      },
      {
        id: '12',
        batchLabel: 'SQUARE CHOCOLATE 22CM',
        flavor: 'chocolate',
        shape: 'square',
        size: 22,
        producedQuantity: 6,
        completedAt: generateRequestDate()
      }
    ]
  });
  
  const handleQuantityChange = (orderId: string, delta: number) => {
    setMockData(prev => ({
      ...prev,
      pendingOrders: prev.pendingOrders.map(order => 
        order.id === orderId 
          ? { ...order, producedQuantity: Math.max(1, order.producedQuantity + delta) }
          : order
      )
    }));
  };
  
  const handleStartMixing = (orderId: string) => {
    const orderToMove = mockData.pendingOrders.find(order => order.id === orderId);
    if (!orderToMove) return;
    
    setMockData(prev => ({
      ...prev,
      pendingOrders: prev.pendingOrders.filter(order => order.id !== orderId),
      activeMixing: [...prev.activeMixing, { 
        id: orderToMove.id,
        flavor: orderToMove.flavor,
        shape: orderToMove.shape,
        size: orderToMove.size,
        batchLabel: orderToMove.batchLabel,
        requestedAt: orderToMove.requestedAt,
        isPriority: orderToMove.isPriority,
        startTime: new Date()
      }]
    }));
    
    toast.success("Started mixing process");
    setActiveTab('in-progress');
  };
  
  const handleCancelTimer = (orderId: string) => {
    const orderToMove = mockData.activeMixing.find(order => order.id === orderId);
    if (!orderToMove) return;
    
    setMockData(prev => ({
      ...prev,
      activeMixing: prev.activeMixing.filter(order => order.id !== orderId),
      pendingOrders: [...prev.pendingOrders, { 
        id: orderToMove.id,
        flavor: orderToMove.flavor,
        shape: orderToMove.shape,
        size: orderToMove.size,
        batchLabel: orderToMove.batchLabel,
        requestedAt: orderToMove.requestedAt,
        isPriority: orderToMove.isPriority,
        requestedQuantity: 5,
        producedQuantity: 5
      }]
    }));
    
    toast("Mixing cancelled", { 
      description: "Order returned to pending queue" 
    });
  };
  
  const handleMixingComplete = (orderId: string) => {
    const orderToMove = mockData.activeMixing.find(order => order.id === orderId);
    if (!orderToMove) return;
    
    setMockData(prev => ({
      ...prev,
      activeMixing: prev.activeMixing.filter(order => order.id !== orderId),
      ovenReady: [...prev.ovenReady, { 
        id: orderToMove.id,
        flavor: orderToMove.flavor,
        shape: orderToMove.shape,
        size: orderToMove.size,
        batchLabel: orderToMove.batchLabel,
        requestedAt: orderToMove.requestedAt,
        isPriority: orderToMove.isPriority,
        requestedQuantity: 5,
        producedQuantity: 5
      }]
    }));
    
    toast.success("Mixing complete! Order ready for oven.");
  };
  
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
      let updatedOvens;
      
      if (!targetOven) return prev;
      
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
    toast.success(`${draggedOrder.batchLabel} moved to Oven ${ovenNumber}. 28 minute timer started!`);
  };
  
  const handleOvenComplete = (ovenNumber: number) => {
    setMockData(prev => {
      const oven = prev.ovens.find(o => o.number === ovenNumber);
      if (!oven) return prev;
      
      const newDailyCompleted = Math.min(
        prev.dailyCompleted + oven.batches.length,
        prev.dailyTarget
      );
      
      toast.success(`Oven ${ovenNumber} complete!`, {
        description: `${oven.batches.length} batches successfully baked.`
      });
      
      // Move batches to completed
      const completedBatches = oven.batches.map(batch => ({
        ...batch,
        completedAt: new Date()
      }));
      
      const updatedOvens = prev.ovens.map(o => {
        if (o.number === ovenNumber) {
          return {
            ...o,
            isActive: false,
            timeRemaining: undefined,
            currentBatch: undefined,
            batches: []
          };
        }
        return o;
      });
      
      return {
        ...prev,
        dailyCompleted: newDailyCompleted,
        ovens: updatedOvens,
        completedBatches: [...prev.completedBatches, ...completedBatches]
      };
    });
    
    if (activeTab === 'in-progress') {
      // Check if there are no more active mixing, oven ready, or active ovens
      const noActiveMixing = mockData.activeMixing.length === 0;
      const noOvenReady = mockData.ovenReady.length === 0;
      const noActiveOvens = mockData.ovens.every(oven => !oven.isActive);
      
      if (noActiveMixing && noOvenReady && noActiveOvens) {
        setActiveTab('done');
      }
    }
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
  
  const dailyProgressPercentage = (mockData.dailyCompleted / mockData.dailyTarget) * 100;
  
  const anyInProgress = mockData.activeMixing.length > 0 || 
                        mockData.ovenReady.length > 0 || 
                        mockData.ovens.some(oven => oven.isActive);

  return (
    <Layout title="Queue">
      <div className="py-0">
        <div className="flex items-start">
          {/* Main content - 75% width */}
          <div className="w-3/4 pr-2">
            <Tabs 
              defaultValue="pending" 
              className="w-full" 
              value={activeTab} 
              onValueChange={setActiveTab}
            >
              <div className="flex items-center justify-between mb-2">
                <TabsList className="w-fit">
                  <TabsTrigger value="pending" className="font-bold">PENDING</TabsTrigger>
                  <TabsTrigger value="in-progress" className="font-bold">IN PROGRESS</TabsTrigger>
                  <TabsTrigger value="done" className="font-bold">DONE</TabsTrigger>
                </TabsList>
                
                <Button size="icon" variant="ghost" className="rounded-full" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun /> : <Moon />}
                </Button>
              </div>

              <div className="h-[calc(100vh-150px)] overflow-hidden">
                <TabsContent value="pending" className="mt-0 h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 pb-4">
                      {mockData.pendingOrders.length > 0 ? (
                        <ScrollableCardSection title="Pending Orders">
                          {mockData.pendingOrders.map(order => (
                            <MixingCard 
                              key={order.id}
                              flavor={order.flavor}
                              shape={order.shape}
                              size={order.size}
                              batchLabel={order.batchLabel}
                              requestedQuantity={order.requestedQuantity}
                              producedQuantity={order.producedQuantity}
                              requestedAt={order.requestedAt}
                              isPriority={order.isPriority}
                              notes={order.notes}
                              onQuantityChange={(delta) => handleQuantityChange(order.id, delta)}
                              onStartMixing={() => handleStartMixing(order.id)}
                            />
                          ))}
                        </ScrollableCardSection>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                          <p className="text-muted-foreground">No batches in the pending queue</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="in-progress" className="mt-0 h-full">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 pb-4">
                      {mockData.activeMixing.length > 0 && (
                        <ScrollableCardSection title="Currently Mixing">
                          {mockData.activeMixing.map(order => (
                            <ActiveMixingCard 
                              key={order.id}
                              flavor={order.flavor}
                              shape={order.shape}
                              size={order.size}
                              batchLabel={order.batchLabel}
                              requestedAt={order.requestedAt}
                              isPriority={order.isPriority}
                              startTime={order.startTime}
                              onCancel={() => handleCancelTimer(order.id)}
                              onComplete={() => handleMixingComplete(order.id)}
                            />
                          ))}
                        </ScrollableCardSection>
                      )}
                      
                      {mockData.ovenReady.length > 0 && (
                        <ScrollableCardSection title="Oven Queue">
                          {mockData.ovenReady.map(order => (
                            <OvenReadyCard 
                              key={order.id}
                              id={order.id}
                              flavor={order.flavor}
                              shape={order.shape}
                              size={order.size}
                              batchLabel={order.batchLabel}
                              requestedAt={order.requestedAt}
                              requestedQuantity={order.requestedQuantity}
                              producedQuantity={order.producedQuantity}
                              isPriority={order.isPriority}
                              onDragStart={handleDragStart}
                            />
                          ))}
                        </ScrollableCardSection>
                      )}
                      
                      {!anyInProgress && (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                          <p className="text-muted-foreground">No batches currently in progress</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="done" className="mt-0 h-full">
                  <ScrollArea className="h-full">
                    <div className="pb-4">
                      <h2 className="text-lg font-bold mb-2">Completed Batches</h2>
                      
                      {mockData.completedBatches.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                          <p className="text-muted-foreground">No completed batches yet</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {mockData.completedBatches.map(batch => (
                            <CompletedBatchItem 
                              key={batch.id}
                              batchLabel={batch.batchLabel}
                              flavor={batch.flavor}
                              shape={batch.shape}
                              size={batch.size}
                              producedQuantity={batch.producedQuantity}
                              completedAt={batch.completedAt}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>
          
          {/* Fixed oven slots - 25% width */}
          <div className="w-1/4 pl-2 pr-0">
            <h2 className="text-lg font-bold mb-2">Oven Slots</h2>
            <div className="space-y-2">
              {mockData.ovens.map(oven => (
                <OvenSlot 
                  key={oven.number}
                  ovenNumber={oven.number}
                  isActive={oven.isActive}
                  timeRemaining={oven.timeRemaining}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop(oven.number)}
                  currentBatch={oven.currentBatch}
                  batches={oven.batches}
                  onComplete={() => handleOvenComplete(oven.number)}
                />
              ))}
            </div>
            
            <div className="mt-4">
              <div className="text-sm font-medium text-muted-foreground mb-1">Daily Progress</div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span>{mockData.dailyCompleted} batches</span>
                <span>Target: {mockData.dailyTarget}</span>
              </div>
              <Progress value={dailyProgressPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QueuePage;
