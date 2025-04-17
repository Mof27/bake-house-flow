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
  TimerOff,
  CheckCircle2,
  XCircle
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
    startTime?: Date;
  }[];
  ovenReady: {
    id: string;
    flavor: CakeFlavor;
    shape: CakeShape;
    size: number;
    batchLabel: string;
    requestedQuantity: number;
    producedQuantity: number;
    requestedAt: Date;
    isPriority: boolean;
  }[];
  ovens: {
    number: number;
    isActive: boolean;
    timeRemaining?: number;
    currentBatch?: {
      id: string;
      batchLabel: string;
      flavor: CakeFlavor;
      producedQuantity: number;
    };
    batches: {
      id: string;
      batchLabel: string;
      flavor: CakeFlavor;
      shape: CakeShape;
      size: number;
      producedQuantity: number;
    }[];
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
      {isNew && (
        <Badge className="absolute top-2 right-2 bg-blue-500 z-10">NEW</Badge>
      )}
      
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
        <h3 className="font-bold text-lg">{batchLabel}</h3>
        
        <div className="text-xs opacity-70 mb-3">
          requested at {formatDateTime(requestedAt)}
        </div>
        
        {notes && (
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 mb-3 text-sm overflow-hidden whitespace-nowrap text-ellipsis">
            {notes}
          </div>
        )}
        
        <div className="flex flex-col space-y-2 mb-4">
          <div className="text-sm font-medium">Asked Qty: {requestedQuantity}</div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Produced Qty: <span className="text-3xl font-bold">{producedQuantity}</span></span>
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
  onCancel: () => void;
  onComplete: () => void;
  startTime?: Date;
}

const ActiveMixingCard: React.FC<ActiveMixingCardProps> = ({
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  isPriority = false,
  onCancel,
  onComplete,
  startTime
}) => {
  const MIXING_TIME = 120; // 2 minutes in seconds
  const WARNING_TIME = 30; // 30 seconds
  
  const [timeLeft, setTimeLeft] = useState<number>(MIXING_TIME);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isTimerExpired, setIsTimerExpired] = useState<boolean>(false);
  
  let baseTextColor = flavor === 'vanilla' ? 'text-amber-950' : 'text-amber-50';
  let baseBgColor = flavor === 'vanilla' ? 'bg-amber-50' : 'bg-amber-900';
  
  let warningBgColor = flavor === 'vanilla' ? 'bg-red-200' : 'bg-red-700';
  let warningTextColor = 'text-white';
  
  let expiredBgColor = 'bg-red-500';
  let expiredTextColor = 'text-white';
  
  let bgColorClass = baseBgColor;
  let textColorClass = baseTextColor;
  let animationClass = '';
  
  if (isTimerExpired) {
    bgColorClass = expiredBgColor;
    textColorClass = expiredTextColor;
  } else if (timeLeft <= WARNING_TIME) {
    bgColorClass = warningBgColor;
    textColorClass = warningTextColor;
    animationClass = 'animate-pulse';
  }
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === WARNING_TIME) {
            toast.warning("30 seconds left on mixing timer!", {
              description: `${batchLabel} mixing will be done soon!`,
              duration: 5000,
            });
            try {
              const audio = new Audio('/beep.mp3');
              audio.play();
            } catch (error) {
              console.log('Audio notification failed:', error);
            }
          }
          
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      if (!isTimerExpired) {
        setIsTimerExpired(true);
        toast.success("Mixing complete!", {
          description: `${batchLabel} is ready to be moved to oven queue`,
        });
      }
      
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, batchLabel, isTimerExpired]);
  
  const progressPercentage = (timeLeft / MIXING_TIME) * 100;
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColorClass} ${textColorClass} ${animationClass}
      ${isPriority ? 'border-2 border-yellow-500' : 'border border-gray-200'}
      hover:shadow-md
    `}>
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
        <h3 className="font-bold text-lg">{batchLabel}</h3>
        
        <div className="text-xs opacity-70 mb-3">
          requested at {formatDateTime(requestedAt)}
        </div>
        
        <div className="flex flex-col items-center mt-4 mb-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            {!isTimerExpired ? (
              <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
            ) : (
              <span className="text-xl font-bold">+{formatTime(elapsedTime)}</span>
            )}
          </div>
          
          {!isTimerExpired && (
            <Progress 
              value={progressPercentage} 
              className="w-full h-2 mt-2" 
            />
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="cancel"
            className="flex-1" 
            onClick={onCancel}
          >
            <XCircle className="mr-1" /> Cancel
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
  requestedQuantity: number;
  producedQuantity: number;
  isPriority?: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  id: string;
}

const OvenReadyCard: React.FC<OvenReadyCardProps> = ({
  id,
  flavor,
  shape,
  size,
  batchLabel,
  requestedAt,
  requestedQuantity,
  producedQuantity,
  isPriority = false,
  onDragStart
}) => {
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';
    
  return (
    <Card 
      className={`
        relative overflow-hidden transition-all
        ${bgColor} 
        ${isPriority ? 'border-2 border-yellow-500' : 'border border-gray-200'}
        hover:shadow-md cursor-move
      `}
      draggable="true"
      onDragStart={(e) => onDragStart(e, id)}
    >
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
        <h3 className="font-bold text-lg">{batchLabel}</h3>
        
        <div className="text-xs opacity-70 mb-3">
          requested at {formatDateTime(requestedAt)}
        </div>
        
        <div className="text-sm font-medium mb-2">
          Qty: <span className="text-3xl font-bold">{producedQuantity}</span>
        </div>
        
        <div className="flex justify-center items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
          <MoveHorizontal className="h-4 w-4 mr-1" /> Drag to an oven slot
        </div>
      </CardContent>
    </Card>
  );
};

// Component for items in the oven
interface OvenItemProps {
  batchLabel: string;
  producedQuantity: number;
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
}

const OvenItem: React.FC<OvenItemProps> = ({
  batchLabel,
  producedQuantity,
  flavor,
  shape,
  size
}) => {
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';

  return (
    <div className={`p-2 ${bgColor} rounded-md mb-1 text-sm`}>
      <h4 className="font-bold text-sm">{batchLabel}</h4>
      <div className="text-xs">
        Qty: <span className="font-bold">{producedQuantity}</span>
      </div>
    </div>
  );
};

// Component for oven slots
interface OvenSlotProps {
  ovenNumber: number;
  isActive?: boolean;
  timeRemaining?: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  currentBatch?: {
    id: string;
    batchLabel: string;
    flavor: CakeFlavor;
    producedQuantity: number;
  };
  batches: {
    id: string;
    batchLabel: string;
    flavor: CakeFlavor;
    shape: CakeShape;
    size: number;
    producedQuantity: number;
  }[];
  onComplete: () => void;
}

const OvenSlot: React.FC<OvenSlotProps> = ({
  ovenNumber,
  isActive = false,
  timeRemaining,
  onDragOver,
  onDrop,
  currentBatch,
  batches,
  onComplete
}) => {
  const OVEN_TIME = 1680; // 28 minutes in seconds
  const WARNING_TIME = 120; // 2 minutes warning
  
  const showWarning = timeRemaining !== undefined && timeRemaining <= WARNING_TIME && timeRemaining > 0;
  const isTimerExpired = timeRemaining !== undefined && timeRemaining <= 0;
  
  const warningClass = showWarning ? 'animate-pulse' : '';
  
  const bgColorClass = isActive 
    ? (showWarning 
        ? 'bg-red-50 border-red-500 dark:bg-red-900/20'
        : (isTimerExpired 
            ? 'bg-red-100 border-red-500 dark:bg-red-900/40'
            : 'bg-green-50 border-green-500 dark:bg-green-900/20'))
    : 'bg-gray-50 border-gray-300 dark:bg-gray-800/50';
  
  const borderClass = isActive ? 'border-2' : 'border-2 border-dashed';
  
  return (
    <Card 
      className={`
        ${borderClass} ${bgColorClass} ${warningClass}
        transition-all flex-1 h-full
      `}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl flex justify-between">
          <span>OVEN {ovenNumber}</span>
          <Badge className={isActive ? (showWarning ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-400'}>
            {isActive ? 'BAKING' : 'STANDBY'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col h-full">
        {isActive && timeRemaining !== undefined ? (
          <div className="flex flex-col h-full">
            <div className="mb-4 text-center">
              <div className="text-3xl font-bold mb-2">
                {timeRemaining > 0 
                  ? formatTime(timeRemaining) 
                  : `+${formatTime(Math.abs(timeRemaining))}`
                }
              </div>
              {timeRemaining > 0 && (
                <Progress 
                  value={(timeRemaining / OVEN_TIME) * 100} 
                  className="w-full h-2 mb-2" 
                />
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 mb-4">
              {batches.length > 0 && (
                <div className="grid grid-cols-1 gap-1" style={{ height: 'calc(100% - 50px)' }}>
                  {batches.map((batch, index) => (
                    <div key={batch.id} style={{ 
                      height: `${100 / batches.length}%`,
                      minHeight: '60px'
                    }}>
                      <OvenItem 
                        batchLabel={batch.batchLabel}
                        producedQuantity={batch.producedQuantity}
                        flavor={batch.flavor}
                        shape={batch.shape}
                        size={batch.size}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              variant="default"
              size="lg"
              className="w-full mt-auto text-lg py-4"
              onClick={onComplete}
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              DONE
            </Button>
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

const QueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  
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
        ovens: updatedOvens
      };
    });
  };
  
  const handleAddNewOrder = () => {
    const shape = Math.random() > 0.5 ? 'round' : 'square' as CakeShape;
    const flavor = Math.random() > 0.5 ? 'vanilla' : 'chocolate' as CakeFlavor;
    const size = Math.floor(Math.random() * 10) + 15;
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
            <div className="hidden md:flex flex-col items-end">
              <div className="text-sm font-medium">{mockData.dailyCompleted} / {mockData.dailyTarget} Batches Completed</div>
              <Progress value={dailyProgressPercentage} className="w-40 h-1.5 mt-1" />
            </div>
            
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
        
        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-240px)] rounded-lg border">
          <ResizablePanel defaultSize={70} minSize={40}>
            <div className="h-full overflow-y-auto p-4 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Pending</h2>
                
                {mockData.pendingOrders.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No batches in the pending queue</p>
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
                        startTime={order.startTime}
                        onCancel={() => handleCancelTimer(order.id)}
                        onComplete={() => handleMixingComplete(order.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
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
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col p-4">
              <h2 className="text-xl font-bold mb-4">Oven Slots</h2>
              
              <div className="flex flex-col flex-1 space-y-4 h-full">
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
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </Layout>
  );
};

export default QueuePage;
