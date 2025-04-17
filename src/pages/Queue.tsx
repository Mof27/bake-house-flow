
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/Layout'; // Fixed import statement
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
  Flame
} from 'lucide-react';
import { useOrders, Order } from '@/contexts/OrderContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface WorkOrderCardProps {
  order: Order;
  isNew?: boolean;
  onStartMixing?: (id: string) => void;
  onQuantityChange?: (id: string, delta: number) => void;
}

const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ 
  order, 
  isNew = false,
  onStartMixing,
  onQuantityChange
}) => {
  // Extract flavor from notes
  const flavorMatch = order.notes.match(/Flavor: (vanilla|chocolate)/i);
  const flavor = flavorMatch ? flavorMatch[1].toLowerCase() : 'vanilla';
  
  // Calculate if the order was created less than 5 minutes ago
  const createdLessThan5MinutesAgo = () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(order.createdAt) > fiveMinutesAgo;
  };
  
  // Extract quantity from notes
  const quantityMatch = order.notes.match(/Quantity: (\d+)/i);
  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
  
  // Base card style
  const cardStyle = `
    relative p-1 h-full
    ${flavor === 'vanilla' ? 'bg-amber-50' : 'bg-amber-200'}
    ${order.isPriority ? 'border-2 border-red-500' : ''}
  `;

  return (
    <Card className={cardStyle}>
      <CardContent className="p-3">
        {/* New badge */}
        {isNew && createdLessThan5MinutesAgo() && (
          <Badge className="absolute top-2 right-2 bg-blue-500">NEW</Badge>
        )}
        
        {/* Priority indicator */}
        {order.isPriority && (
          <div className="absolute top-2 left-2 flex items-center">
            <Flame className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-xs font-bold text-red-500">RUSH</span>
          </div>
        )}
        
        {/* Batch label */}
        <h3 className="font-medium text-lg mt-4">{order.designName}</h3>
        
        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={() => onQuantityChange && onQuantityChange(order.id, -1)}
              disabled={quantity <= 1}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span className="mx-2 font-bold">{quantity}</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={() => onQuantityChange && onQuantityChange(order.id, 1)}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Start mixing button */}
        <Button 
          className="w-full mt-4"
          onClick={() => onStartMixing && onStartMixing(order.id)}
        >
          <PlayCircle className="h-4 w-4 mr-2" />
          Start Mixing
        </Button>
      </CardContent>
    </Card>
  );
};

interface MixingCardProps {
  order: Order;
  onMixingComplete: (id: string) => void;
  onResetTimer: (id: string) => void;
  onAddMinutes: (id: string, minutes: number) => void;
}

const MixingCard: React.FC<MixingCardProps> = ({ 
  order, 
  onMixingComplete,
  onResetTimer,
  onAddMinutes
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [showExtendPrompt, setShowExtendPrompt] = useState<boolean>(false);
  
  // Extract flavor from notes
  const flavorMatch = order.notes.match(/Flavor: (vanilla|chocolate)/i);
  const flavor = flavorMatch ? flavorMatch[1].toLowerCase() : 'vanilla';
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          // When 1 minute is left, show notification
          if (prev === 60) {
            toast("1 minute left on mixing timer!", {
              description: `${order.designName} mixing will be done soon!`,
              duration: 5000,
            });
          }
          
          // When timer ends
          if (prev === 1) {
            setTimerActive(false);
            setShowExtendPrompt(true);
          }
          
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, order.designName]);
  
  // Calculate progress percentage
  const progressPercentage = (timeLeft / 600) * 100;
  
  // Base card style
  const cardStyle = `
    relative p-1 h-full
    ${flavor === 'vanilla' ? 'bg-amber-50' : 'bg-amber-200'}
    ${order.isPriority ? 'border-2 border-red-500' : ''}
  `;
  
  return (
    <Card className={cardStyle}>
      <CardContent className="p-3">
        {/* Priority indicator */}
        {order.isPriority && (
          <div className="absolute top-2 left-2 flex items-center">
            <Flame className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-xs font-bold text-red-500">RUSH</span>
          </div>
        )}
        
        {/* Batch label */}
        <h3 className="font-medium text-lg mt-4">{order.designName}</h3>
        
        {/* Timer display */}
        <div className="flex flex-col items-center mt-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="w-full h-2 mt-2" 
          />
        </div>
        
        {showExtendPrompt ? (
          <div className="mt-4 space-y-2">
            <p className="text-center text-sm font-medium">Add more mixing time?</p>
            <div className="flex justify-around">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onAddMinutes(order.id, 2);
                  setTimeLeft(120); // 2 minutes
                  setTimerActive(true);
                  setShowExtendPrompt(false);
                }}
              >
                +2 min
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  onAddMinutes(order.id, 5);
                  setTimeLeft(300); // 5 minutes
                  setTimerActive(true);
                  setShowExtendPrompt(false);
                }}
              >
                +5 min
              </Button>
              <Button 
                variant="default"
                size="sm"
                onClick={() => onMixingComplete(order.id)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex mt-4 space-x-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setTimerActive(false);
                onResetTimer(order.id);
                setTimeLeft(600); // Reset to 10 minutes
                setTimerActive(true);
              }}
            >
              Reset
            </Button>
            <Button 
              variant="default"
              className="flex-1"
              onClick={() => onMixingComplete(order.id)}
            >
              Stop Mixing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Queue Component
const QueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, updateOrderStatus, updateOrderQuantity } = useOrders();
  const [queuedOrders, setQueuedOrders] = useState<Order[]>([]);
  const [mixingOrders, setMixingOrders] = useState<Order[]>([]);
  const [ovenReadyOrders, setOvenReadyOrders] = useState<Order[]>([]);
  
  // Filter and sort orders based on their status
  useEffect(() => {
    // Get queued orders and sort by priority first, then creation time
    const queued = orders.filter(order => order.status === 'queued');
    queued.sort((a, b) => {
      if (a.isPriority !== b.isPriority) {
        return a.isPriority ? -1 : 1;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    // Filter for orders in mixing
    const mixing = orders.filter(order => order.status === 'baking');
    
    // For now, we'll use this status for oven-ready orders (could be extended later)
    const ovenReady = orders.filter(order => order.status === 'done' && !order.completedAt);
    
    setQueuedOrders(queued);
    setMixingOrders(mixing);
    setOvenReadyOrders(ovenReady);
  }, [orders]);

  // Handle starting the mixing process
  const handleStartMixing = (orderId: string) => {
    updateOrderStatus(orderId, 'baking');
    toast.success("Started mixing process");
  };
  
  // Handle mixing complete
  const handleMixingComplete = (orderId: string) => {
    // Update order to some intermediate status or just use 'done' for now
    updateOrderStatus(orderId, 'done');
    toast.success("Mixing complete! Order ready for oven.");
  };
  
  // Handle resetting timer
  const handleResetTimer = (orderId: string) => {
    console.log(`Reset timer for order ${orderId}`);
    toast("Timer reset", { description: "Mixing timer has been reset to 10 minutes" });
  };
  
  // Handle adding minutes to timer
  const handleAddMinutes = (orderId: string, minutes: number) => {
    console.log(`Added ${minutes} minutes to order ${orderId}`);
    toast.success(`Added ${minutes} minutes to mixing time`);
  };
  
  // Handle quantity change
  const handleQuantityChange = (orderId: string, delta: number) => {
    console.log(`Changed quantity by ${delta} for order ${orderId}`);
    // Use the updateOrderQuantity function from the context to actually update the order
    updateOrderQuantity(orderId, delta)
      .then(() => {
        // Toast will be shown by the context function
      })
      .catch(error => {
        toast.error("Failed to update quantity");
        console.error(error);
      });
  };
  
  return (
    <Layout title="Queue">
      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="in-oven">In Oven</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>
        
        <TabsContent value="queue" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Work Order Queue</h2>
            <Button onClick={() => navigate('/new-order')}>
              <PlusCircle className="h-4 w-4 mr-2" /> New Order
            </Button>
          </div>
          
          {/* Queued Orders Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Pending Orders ({queuedOrders.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {queuedOrders.map(order => (
                <WorkOrderCard 
                  key={order.id} 
                  order={order}
                  isNew={true}
                  onStartMixing={handleStartMixing}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
            
            {queuedOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pending orders. Create a new order to get started.
              </div>
            )}
          </div>
          
          {/* Mixing Orders Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3">Mixing in Progress ({mixingOrders.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mixingOrders.map(order => (
                <MixingCard 
                  key={order.id} 
                  order={order}
                  onMixingComplete={handleMixingComplete}
                  onResetTimer={handleResetTimer}
                  onAddMinutes={handleAddMinutes}
                />
              ))}
            </div>
            
            {mixingOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No orders currently mixing.
              </div>
            )}
          </div>
          
          {/* Oven Queue Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3">Ready for Oven ({ovenReadyOrders.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ovenReadyOrders.map(order => (
                <Card key={order.id} className="p-4">
                  <h4 className="font-medium">{order.designName}</h4>
                  <div className="mt-2 flex justify-center">
                    <p className="text-sm text-muted-foreground">Drag to an oven slot</p>
                  </div>
                </Card>
              ))}
            </div>
            
            {ovenReadyOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No orders ready for oven.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="in-oven">
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-4">In Oven View</h2>
            <p className="text-muted-foreground">
              This tab will show orders currently in the oven with live countdowns.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="done">
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-4">Done Orders</h2>
            <p className="text-muted-foreground">
              This tab will show completed orders in a list view.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default QueuePage;
