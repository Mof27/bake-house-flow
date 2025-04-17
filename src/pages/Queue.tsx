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
  Flame,
  Moon,
  Sun,
  MoveHorizontal,
  TimerOff,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useOrders, Order } from '@/contexts/OrderContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Sheet,
  SheetTrigger,
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

type CakeFlavor = 'vanilla' | 'chocolate';
type CakeShape = 'round' | 'square';

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
  completedBatches: {
    id: string;
    batchLabel: string;
    flavor: CakeFlavor;
    shape: CakeShape;
    size: number;
    producedQuantity: number;
    completedAt: Date;
  }[];
}

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
  onQuantityChange,
  onStartMixing
}) => {
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';
  
  return (
    <Card className={`
      relative overflow-hidden transition-all
      ${bgColor} 
      ${isPriority ? 'border-2 border-yellow-500' : 'border border-gray-200'}
      hover:shadow-md w-[180px] h-[180px] flex-shrink-0
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
      
      <CardContent className="p-2 h-full flex flex-col">
        <h3 className="font-bold text-sm truncate">{batchLabel}</h3>
        
        <div className="text-xs opacity-70 mb-1">
          {formatDateTime(requestedAt)}
        </div>
        
        {notes && (
          <div className="mb-1 text-xs bg-muted/50 p-1 rounded truncate">
            {notes}
          </div>
        )}
        
        <div className="flex flex-col space-y-1 mb-2 mt-auto">
          <div className="text-xs font-medium">Asked Qty: {requestedQuantity}</div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Produced: <span className="text-lg font-bold">{producedQuantity}</span></span>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => onQuantityChange(-1)}
                disabled={producedQuantity <= 1}
              >
                <MinusCircle className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => onQuantityChange(1)}
              >
                <PlusCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full text-xs py-1 h-8 mt-auto" 
          onClick={onStartMixing}
        >
          <PlayCircle className="mr-1 h-3 w-3" /> Start Mixing
        </Button>
      </CardContent>
    </Card>
  );
};

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
    animationClass = 'animate-pulse';
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
      hover:shadow-md w-[180px] h-[180px] flex-shrink-0
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
      
      <CardContent className="p-2 h-full flex flex-col">
        <h3 className="font-bold text-sm truncate">{batchLabel}</h3>
        
        <div className="text-xs opacity-70 mb-1">
          {formatDateTime(requestedAt)}
        </div>
        
        <div className="flex flex-col items-center mt-1 mb-1 flex-grow">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
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
        
        <div className="flex space-x-2 mt-auto">
          <Button 
            variant="cancel"
            className="flex-1 text-xs py-1 h-8" 
            onClick={onCancel}
          >
            <XCircle className="mr-1 h-3 w-3" /> Cancel
          </Button>
          <Button 
            variant="default"
            className="flex-1 text-xs py-1 h-8"
            onClick={onComplete}
          >
            <TimerOff className="mr-1 h-3 w-3" /> Finish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

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
        hover:shadow-md cursor-move w-[180px] h-[180px] flex-shrink-0
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
      
      <CardContent className="p-2 h-full flex flex-col">
        <h3 className="font-bold text-sm truncate">{batchLabel}</h3>
        
        <div className="text-xs opacity-70 mb-1">
          {formatDateTime(requestedAt)}
        </div>
        
        <div className="text-xs font-medium mb-1 mt-auto">
          Qty: <span className="text-xl font-bold">{producedQuantity}</span>
        </div>
        
        <div className="flex justify-center items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <MoveHorizontal className="h-3 w-3 mr-1" /> Drag to an oven slot
        </div>
      </CardContent>
    </Card>
  );
};

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
    <div className={`p-1 ${bgColor} rounded-md text-xs w-full h-full flex flex-col justify-center`}>
      <h4 className="font-bold text-xs truncate">{batchLabel}</h4>
      <div className="text-xs">
        Qty: <span className="font-bold">{producedQuantity}</span>
      </div>
    </div>
  );
};

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
        transition-all h-[200px] mb-2
      `}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardHeader className="p-1 pb-0">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>OVEN {ovenNumber}</span>
          <Badge className={isActive ? (showWarning ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-400'}>
            {isActive ? 'BAKING' : 'STANDBY'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-1 pt-0 flex flex-col h-[calc(100%-32px)]">
        {isActive && timeRemaining !== undefined ? (
          <div className="flex flex-col h-full">
            <div className="text-center py-1">
              <div className="text-2xl font-bold">
                {timeRemaining > 0 
                  ? formatTime(timeRemaining) 
                  : `+${formatTime(Math.abs(timeRemaining))}`
                }
              </div>
              
              {timeRemaining > 0 && (
                <Progress 
                  value={(timeRemaining / OVEN_TIME) * 100} 
                  className="w-full h-2 my-1" 
                />
              )}
              
              <Button
                variant="default"
                size="sm"
                className="w-full my-1 text-sm"
                onClick={onComplete}
              >
                <CheckCircle2 className="mr-1 h-3 w-3" /> DONE
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {batches.length > 0 ? (
                <div className="grid grid-cols-1 gap-0.5 h-full">
                  {batches.map((batch, index) => (
                    <div key={batch.id} style={{ 
                      height: `${100 / batches.length}%`,
                      minHeight: '30px'
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
              ) : null}
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex-1 flex items-center justify-center">
            Drop batch here to start baking
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface CompletedBatchItemProps {
  batchLabel: string;
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  producedQuantity: number;
  completedAt: Date;
}

const CompletedBatchItem: React.FC<CompletedBatchItemProps> = ({
  batchLabel,
  flavor,
  shape,
  size,
  producedQuantity,
  completedAt
}) => {
  const bgColor = flavor === 'vanilla' 
    ? 'bg-amber-50 text-amber-950' 
    : 'bg-amber-900 text-amber-50';
    
  return (
    <div className={`flex items-center justify-between p-2 ${bgColor} rounded-md mb-1`}>
      <div>
        <div className="font-bold text-sm truncate">{batchLabel}</div>
        <div className="text-xs">Qty: {producedQuantity}</div>
      </div>
      <div className="text-xs opacity-70">
        {formatDateTime(completedAt)}
      </div>
    </div>
  );
};

interface ScrollableCardSectionProps {
  children: React.ReactNode;
  title: string;
}

const ScrollableCardSection: React.FC<ScrollableCardSectionProps> = ({ children, title }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const checkForScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkForScrollButtons();
    window.addEventListener('resize', checkForScrollButtons);
    return () => window.removeEventListener('resize', checkForScrollButtons);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(checkForScrollButtons, 300);
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <div className="relative">
        {showLeftArrow && (
          <Button 
            variant="outline" 
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide" 
          onScroll={checkForScrollButtons}
        >
          {children}
        </div>
        
        {showRightArrow && (
          <Button 
            variant="outline" 
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const QueuePage: React.FC = () => {
  const navigate = useNavigate();
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
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </Layout>
  );
};

export default QueuePage;
