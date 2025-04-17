
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Clock,
  AlertTriangle,
  Bell,
  PlayCircle,
  PlusCircle, 
  MinusCircle,
  Printer,
  Flame,
  Moon,
  Sun,
  Search,
  Flag,
  MoveHorizontal,
  RefreshCw,
  TimerOff
} from 'lucide-react';
import { useOrders, Order } from '@/contexts/OrderContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useTheme } from '@/contexts/ThemeContext';

// Define a union type for flavors to ensure type safety
type CakeFlavor = 'vanilla' | 'chocolate';
type CakeShape = 'round' | 'square';

// Define interface for mock data structure
interface MockData {
  dailyCompleted: number;
  dailyTarget: number;
  pendingOrders: {
    id: string;
    flavor: CakeFlavor;
    shape: CakeShape;
    size: number;
    batchLabel: string;
    requestedQuantity: number;
    producedQuantity: number;
    requestedAt: Date;
    isPriority: boolean;
    notes?: string;
    isNew?: boolean;
  }[];
  activeMixing: {
    id: string;
    flavor: CakeFlavor;
    shape: CakeShape;
    size: number;
    batchLabel: string;
    requestedAt: Date;
    isPriority: boolean;
  }[];
  ovenReady: {
    id: string;
    flavor: CakeFlavor;
    shape: CakeShape;
    size: number;
    batchLabel: string;
    requestedAt: Date;
    isPriority: boolean;
  }[];
  ovens: {
    number: number;
    isActive: boolean;
    timeRemaining?: number;
  }[];
}

// Utility functions
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const generateBatchLabel = () => {
  const shape = Math.random() > 0.5 ? 'ROUND' : 'SQUARE';
  const type = Math.random() > 0.5 ? 'VANILLA' : 'CHOCOLATE';
  const size = Math.floor(Math.random() * 10) + 15; // 15-24cm
  return `${shape} ${type} ${size}CM`;
};

// Component for mixing queue cards
interface MixingCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedQuantity: number;
  producedQuantity: number;
  requestedAt: Date;
  isPriority?: boolean;
  notes?: string;
  isNew?: boolean;
  onQuantityChange: (delta: number) => void;
  onStartMixing: () => void;
}

const MixingCard: React.FC<MixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedQuantity,
  producedQuantity,
  requestedAt,
  isPriority = false,
  notes,
  isNew = false,
  onQuantityChange,
  onStartMixing
}) => {
  // Card background color based on flavor
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor} 
      ${isPriority ? 'border-2 border-yellow-500' : 'border border-gray-200'}
      hover:shadow-md
    `}>
      {/* New badge */}
      {isNew && (
        <Badge className="absolute top-2 right-2 bg-blue-500 z-10">NEW</Badge>
      )}
      
      {/* Priority indicator */}
      {isPriority && (
        <div className="absolute top-0 right-0">
          <div className="w-0 h-0 
            border-t-[30px] border-t-yellow-500
            border-l-[30px] border-l-transparent">
          </div>
          <Flame className="absolute top-1 right-1 h-4 w-4 text-white" />
        </div>
      )}
      
      <CardContent className="p-4">
        {/* Batch label */}
        <h3 className="font-bold text-lg">{batchLabel}</h3>
        
        {/* Requested at */}
        <div className="text-xs opacity-70 mb-3">
          requested at {formatDateTime(requestedAt)}
        </div>
        
        {/* Notes if they exist */}
        {notes && (
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 mb-3 text-sm overflow-hidden whitespace-nowrap text-ellipsis">
            {notes}
          </div>
        )}
        
        {/* Quantity section */}
        <div className="flex flex-col space-y-2 mb-4">
          <div className="text-sm font-medium">Asked Qty: {requestedQuantity}</div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Produced Qty: {producedQuantity}</span>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onQuantityChange(-1)}
                disabled={producedQuantity <= 1}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onQuantityChange(1)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Start mixing button */}
        <Button 
          className="w-full" 
          onClick={onStartMixing}
        >
          <PlayCircle className="mr-2" /> Start Mixing
        </Button>
      </CardContent>
    </Card>
  );
};

// Component for active mixing cards with timer
interface ActiveMixingCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedAt: Date;
  isPriority?: boolean;
  onReset: () => void;
  onComplete: () => void;
}

const ActiveMixingCard: React.FC<ActiveMixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  isPriority = false,
  onReset,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState<boolean>(true);
  
  // Card background color based on flavor
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';
    
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          // When 1 minute is left, show notification
          if (prev === 60) {
            toast("1 minute left on mixing timer!", {
              description: `${batchLabel} mixing will be done soon!`,
              duration: 5000,
            });
          }
          
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      toast.success("Mixing complete!", {
        description: `${batchLabel} is ready to be moved to oven queue`,
      });
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, batchLabel]);
  
  // Calculate progress percentage
  const progressPercentage = (timeLeft / 600) * 100;
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor} 
      ${isPriority ? 'border-2 border-yellow-500' : 'border border-gray-200'}
      hover:shadow-md
    `}>
      {/* Priority indicator */}
      {isPriority && (
        <div className="absolute top-0 right-0">
          <div className="w-0 h-0 
            border-t-[30px] border-t-yellow-500
            border-l-[30px] border-l-transparent">
          </div>
          <Flame className="absolute top-1 right-1 h-4 w-4 text-white" />
        </div>
      )}
      
      <CardContent className="p-4">
        {/* Batch label */}
        <h3 className="font-bold text-lg">{batchLabel}</h3>
        
        {/* Requested at */}
        <div className="text-xs opacity-70 mb-3">
          requested at {formatDateTime(requestedAt)}
        </div>
        
        {/* Timer display */}
        <div className="flex flex-col items-center mt-4 mb-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="w-full h-2 mt-2" 
          />
        </div>
        
        {/* Control buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onReset}
          >
            <RefreshCw className="mr-1" /> Reset
          </Button>
          <Button 
            variant="default"
            className="flex-1"
            onClick={onComplete}
          >
            <TimerOff className="mr-1" /> Finish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for oven queue cards (ready to be moved to oven)
interface OvenReadyCardProps {
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedAt: Date;
  isPriority?: boolean;
}

const OvenReadyCard: React.FC<OvenReadyCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  isPriority = false
}) => {
  // Card background color based on flavor
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';
    
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor} 
      ${isPriority ? 'border-2 border-yellow-500' : 'border border-gray-200'}
      hover:shadow-md cursor-move
    `}>
      {/* Priority indicator */}
      {isPriority && (
        <div className="absolute top-0 right-0">
          <div className="w-0 h-0 
            border-t-[30px] border-t-yellow-500
            border-l-[30px] border-l-transparent">
          </div>
          <Flame className="absolute top-1 right-1 h-4 w-4 text-white" />
        </div>
      )}
      
      <CardContent className="p-4">
        {/* Batch label */}
        <h3 className="font-bold text-lg">{batchLabel}</h3>
        
        {/* Requested at */}
        <div className="text-xs opacity-70 mb-3">
          requested at {formatDateTime(requestedAt)}
        </div>
        
        {/* Drag indicator */}
        <div className="flex justify-center items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
          <MoveHorizontal className="h-4 w-4 mr-1" /> Drag to an oven slot
        </div>
      </CardContent>
    </Card>
  );
};

// Component for oven slots
interface OvenSlotProps {
  ovenNumber: number;
  isActive?: boolean;
  timeRemaining?: number;
}

const OvenSlot: React.FC<OvenSlotProps> = ({
  ovenNumber,
  isActive = false,
  timeRemaining
}) => {
  return (
    <Card className={`
      border-2 ${isActive 
        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
        : 'border-dashed border-gray-300 bg-gray-50 dark:bg-gray-800/50'} 
      transition-all h-1/2
    `}>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xl flex justify-between">
          <span>OVEN {ovenNumber}</span>
          <Badge className={isActive ? 'bg-green-500' : 'bg-gray-400'}>
            {isActive ? 'BAKING' : 'STANDBY'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col">
        {isActive && timeRemaining ? (
          <div className="flex flex-col items-center flex-1 justify-center">
            <div className="text-2xl font-bold mb-2">
              {formatTime(timeRemaining)}
            </div>
            <Progress 
              value={(timeRemaining / 1800) * 100} 
              className="w-full h-2" 
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex-1 flex items-center justify-center">
            Drop batch here to start baking
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Queue Component
const QueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Generate a request date in the past few hours
  const generateRequestDate = () => {
    const now = new Date();
    // Random time between 0 and 5 hours ago
    const hoursAgo = Math.random() * 5;
    now.setHours(now.getHours() - hoursAgo);
    return now;
  };
  
  // Mock data for UI demonstration
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
        notes: 'Birthday cake for Sarah',
        isNew: true
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
        isPriority: false,
        isNew: false
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
        isPriority: false
      }
    ],
    ovenReady: [
      {
        id: '4',
        flavor: 'chocolate',
        shape: 'round',
        size: 22,
        batchLabel: 'ROUND CHOCOLATE 22CM',
        requestedAt: generateRequestDate(),
        isPriority: true
      }
    ],
    ovens: [
      {
        number: 1,
        isActive: true,
        timeRemaining: 1250 // seconds
      },
      {
        number: 2,
        isActive: false
      }
    ]
  });
  
  // Handle quantity change
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
  
  // Handle start mixing
  const handleStartMixing = (orderId: string) => {
    // Find the order
    const orderToMove = mockData.pendingOrders.find(order => order.id === orderId);
    if (!orderToMove) return;
    
    // Move from pending to active mixing
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
        isPriority: orderToMove.isPriority
      }]
    }));
    
    toast.success("Started mixing process");
  };
  
  // Handle reset timer
  const handleResetTimer = (orderId: string) => {
    toast("Timer reset", { 
      description: "Mixing timer has been reset to 10 minutes" 
    });
  };
  
  // Handle mixing complete
  const handleMixingComplete = (orderId: string) => {
    // Find the order
    const orderToMove = mockData.activeMixing.find(order => order.id === orderId);
    if (!orderToMove) return;
    
    // Move from active mixing to oven ready
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
        isPriority: orderToMove.isPriority
      }]
    }));
    
    toast.success("Mixing complete! Order ready for oven.");
  };
  
  // Create a new mock order
  const handleAddNewOrder = () => {
    const shape = Math.random() > 0.5 ? 'round' : 'square' as CakeShape;
    const flavor = Math.random() > 0.5 ? 'vanilla' : 'chocolate' as CakeFlavor;
    const size = Math.floor(Math.random() * 10) + 15; // 15-24cm
    const requestedQuantity = Math.floor(Math.random() * 5) + 1;
    const isPriority = Math.random() > 0.7;
    
    const newOrder = {
      id: `new-${Date.now()}`,
      flavor,
      shape,
      size,
      batchLabel: `${shape.toUpperCase()} ${flavor.toUpperCase()} ${size}CM`,
      requestedQuantity,
      producedQuantity: requestedQuantity,
      requestedAt: new Date(),
      isPriority,
      isNew: true
    };
    
    setMockData(prev => ({
      ...prev,
      pendingOrders: [...prev.pendingOrders, newOrder]
    }));
    
    if (newOrder.isPriority) {
      // Show priority notification
      toast(
        <div className="flex flex-col items-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
          <div className="text-lg font-bold">Priority Order Added!</div>
          <div>New priority batch added to the queue</div>
        </div>,
        {
          duration: 5000,
        }
      );
    } else {
      toast.success("New order added to queue");
    }
  };
  
  // Daily progress percentage
  const dailyProgressPercentage = (mockData.dailyCompleted / mockData.dailyTarget) * 100;
  
  return (
    <Layout title="Queue">
      <div className="pb-4">
        <div className="flex items-center justify-between mb-6">
          <Tabs defaultValue="queue" className="w-full">
            <TabsList className="w-fit">
              <TabsTrigger value="queue" className="font-bold text-primary">QUEUE</TabsTrigger>
              <TabsTrigger value="in-oven">IN OVEN</TabsTrigger>
              <TabsTrigger value="done">DONE</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-6">
            {/* Daily KPI */}
            <div className="hidden md:flex flex-col items-end">
              <div className="text-sm font-medium">{mockData.dailyCompleted} / {mockData.dailyTarget} Batches Completed</div>
              <Progress value={dailyProgressPercentage} className="w-40 h-1.5 mt-1" />
            </div>
            
            {/* Action icons */}
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="rounded-full">
                <Bell />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun /> : <Moon />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button size="pill" onClick={() => toast("Printing all queued orders...")}>
              <Printer className="mr-1" /> Print All Queued
            </Button>
            <Button variant="priority" size="pill" onClick={handleAddNewOrder}>
              <Flag className="mr-1" /> Add Test Order
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center max-w-xs relative">
              <Search className="absolute left-3 h-4 w-4 opacity-50" />
              <Input 
                placeholder="Search batches..." 
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center text-sm">
              <Badge className="bg-blue-500 h-2 w-2 rounded-full p-0 mr-2" />
              <span className="text-muted-foreground">NEW = added &lt; 5 min ago</span>
            </div>
          </div>
        </div>
        
        {/* Main content with resizable panels */}
        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-240px)] rounded-lg border">
          {/* Left panel: Mixing queue and oven queue */}
          <ResizablePanel defaultSize={70} minSize={40}>
            <div className="h-full overflow-y-auto p-4 space-y-6">
              {/* Mixing Queue Section */}
              <div>
                <h2 className="text-xl font-bold mb-4">Mixing Queue</h2>
                
                {mockData.pendingOrders.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No batches in the mixing queue</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        isNew={order.isNew}
                        onQuantityChange={(delta) => handleQuantityChange(order.id, delta)}
                        onStartMixing={() => handleStartMixing(order.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Active Mixing Section */}
              {mockData.activeMixing.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Currently Mixing</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {mockData.activeMixing.map(order => (
                      <ActiveMixingCard 
                        key={order.id}
                        flavor={order.flavor}
                        shape={order.shape}
                        size={order.size}
                        batchLabel={order.batchLabel}
                        requestedAt={order.requestedAt}
                        isPriority={order.isPriority}
                        onReset={() => handleResetTimer(order.id)}
                        onComplete={() => handleMixingComplete(order.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Oven Queue Section */}
              <div>
                <h2 className="text-xl font-bold mb-4">Oven Queue</h2>
                
                {mockData.ovenReady.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">Drag here once mixing is complete</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {mockData.ovenReady.map(order => (
                      <OvenReadyCard 
                        key={order.id}
                        flavor={order.flavor}
                        shape={order.shape}
                        size={order.size}
                        batchLabel={order.batchLabel}
                        requestedAt={order.requestedAt}
                        isPriority={order.isPriority}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Right panel: Oven slots */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col p-4">
              <h2 className="text-xl font-bold mb-4">Oven Slots</h2>
              
              <div className="flex flex-col flex-1 space-y-4">
                {mockData.ovens.map(oven => (
                  <OvenSlot 
                    key={oven.number}
                    ovenNumber={oven.number}
                    isActive={oven.isActive}
                    timeRemaining={oven.timeRemaining}
                  />
                ))}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </Layout>
  );
};

export default QueuePage;
