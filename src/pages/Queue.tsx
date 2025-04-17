
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

// Define interface for mock data structure
interface MockData {
  dailyCompleted: number;
  dailyTarget: number;
  pendingOrders: {
    id: string;
    flavor: CakeFlavor;
    batchLabel: string;
    quantity: number;
    secretCode: string;
    isPriority: boolean;
    notes?: string;
    isNew?: boolean;
  }[];
  activeMixing: {
    id: string;
    flavor: CakeFlavor;
    batchLabel: string;
    secretCode: string;
    isPriority: boolean;
  }[];
  ovenReady: {
    id: string;
    flavor: CakeFlavor;
    batchLabel: string;
    secretCode: string;
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

const generateBatchLabel = () => {
  const size = Math.floor(Math.random() * 10) + 15; // 15-24cm
  const type = Math.random() > 0.5 ? 'VC' : 'CC'; // Vanilla Cake or Chocolate Cake
  const date = new Date();
  const dateStr = `${date.getDate().toString().padStart(2, '0')}${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]}`;
  const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  return `${size}cm | ${type} | ${dateStr}-${timeStr}`;
};

const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Component for mixing queue cards
interface MixingCardProps {
  flavor: CakeFlavor;
  batchLabel: string;
  quantity: number;
  secretCode: string;
  isPriority?: boolean;
  notes?: string;
  isNew?: boolean;
  onQuantityChange: (delta: number) => void;
  onStartMixing: () => void;
}

const MixingCard: React.FC<MixingCardProps> = ({
  flavor,
  batchLabel,
  quantity,
  secretCode,
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
        
        {/* Secret code */}
        <div className="text-xs opacity-70 mb-3">Code: {secretCode}</div>
        
        {/* Notes if they exist */}
        {notes && (
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 mb-3 text-sm overflow-hidden whitespace-nowrap text-ellipsis">
            {notes}
          </div>
        )}
        
        {/* Quantity controls */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Qty: {quantity}</span>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={() => onQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <MinusCircle />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={() => onQuantityChange(1)}
            >
              <PlusCircle />
            </Button>
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
  batchLabel: string;
  secretCode: string;
  isPriority?: boolean;
  onReset: () => void;
  onComplete: () => void;
}

const ActiveMixingCard: React.FC<ActiveMixingCardProps> = ({
  flavor,
  batchLabel,
  secretCode,
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
        
        {/* Secret code */}
        <div className="text-xs opacity-70 mb-3">Code: {secretCode}</div>
        
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
            <RefreshCw /> Reset
          </Button>
          <Button 
            variant="default"
            className="flex-1"
            onClick={onComplete}
          >
            <TimerOff /> Finish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for oven queue cards (ready to be moved to oven)
interface OvenReadyCardProps {
  flavor: CakeFlavor;
  batchLabel: string;
  secretCode: string;
  isPriority?: boolean;
}

const OvenReadyCard: React.FC<OvenReadyCardProps> = ({
  flavor,
  batchLabel,
  secretCode,
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
        
        {/* Secret code */}
        <div className="text-xs opacity-70">{secretCode}</div>
        
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
      transition-all
    `}>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xl flex justify-between">
          <span>OVEN {ovenNumber}</span>
          <Badge className={isActive ? 'bg-green-500' : 'bg-gray-400'}>
            {isActive ? 'BAKING' : 'STANDBY'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isActive && timeRemaining ? (
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold mb-2">
              {formatTime(timeRemaining)}
            </div>
            <Progress 
              value={(timeRemaining / 1800) * 100} 
              className="w-full h-2" 
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
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
  
  // Mock data for UI demonstration
  const [mockData, setMockData] = useState<MockData>({
    dailyCompleted: 12,
    dailyTarget: 20,
    pendingOrders: [
      {
        id: '1',
        flavor: 'vanilla',
        batchLabel: generateBatchLabel(),
        quantity: 4,
        secretCode: generateRandomCode(),
        isPriority: true,
        notes: 'Birthday cake for Sarah',
        isNew: true
      },
      {
        id: '2',
        flavor: 'chocolate',
        batchLabel: generateBatchLabel(),
        quantity: 2,
        secretCode: generateRandomCode(),
        isPriority: false,
        isNew: false
      }
    ],
    activeMixing: [
      {
        id: '3',
        flavor: 'vanilla',
        batchLabel: generateBatchLabel(),
        secretCode: generateRandomCode(),
        isPriority: false
      }
    ],
    ovenReady: [
      {
        id: '4',
        flavor: 'chocolate',
        batchLabel: generateBatchLabel(),
        secretCode: generateRandomCode(),
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
          ? { ...order, quantity: Math.max(1, order.quantity + delta) }
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
        batchLabel: orderToMove.batchLabel,
        secretCode: orderToMove.secretCode,
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
        batchLabel: orderToMove.batchLabel,
        secretCode: orderToMove.secretCode,
        isPriority: orderToMove.isPriority
      }]
    }));
    
    toast.success("Mixing complete! Order ready for oven.");
  };
  
  // Create a new mock order
  const handleAddNewOrder = () => {
    const newOrder = {
      id: `new-${Date.now()}`,
      flavor: Math.random() > 0.5 ? 'vanilla' : 'chocolate' as CakeFlavor,
      batchLabel: generateBatchLabel(),
      quantity: Math.floor(Math.random() * 5) + 1,
      secretCode: generateRandomCode(),
      isPriority: Math.random() > 0.7,
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
                        batchLabel={order.batchLabel}
                        quantity={order.quantity}
                        secretCode={order.secretCode}
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
                        batchLabel={order.batchLabel}
                        secretCode={order.secretCode}
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
                        batchLabel={order.batchLabel}
                        secretCode={order.secretCode}
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
            <div className="h-full overflow-y-auto p-4 space-y-6">
              <h2 className="text-xl font-bold mb-4">Oven Slots</h2>
              
              <div className="space-y-6">
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
