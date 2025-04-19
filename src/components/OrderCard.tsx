
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Printer, Flag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrders, Order, OrderStatus } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';

// Function to format elapsed time as MM:SS
const formatElapsedTime = (startTime: Date, endTime: Date = new Date()) => {
  const diffMs = endTime.getTime() - new Date(startTime).getTime();
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Function to format date/time
const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

interface OrderCardProps {
  order: Order;
  displayActions?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, displayActions = true }) => {
  const { updateOrderStatus, printLabel } = useOrders();
  const { user } = useAuth();
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isOverdue, setIsOverdue] = useState(false);
  
  // Update elapsed time every second
  useEffect(() => {
    if (order.status !== 'done') {
      const intervalId = setInterval(() => {
        const startTime = order.startedAt || order.createdAt;
        setElapsedTime(formatElapsedTime(startTime));
        
        // Check if overdue
        if (order.status !== 'done') {
          const diffMinutes = (new Date().getTime() - new Date(startTime).getTime()) / 60000;
          setIsOverdue(diffMinutes > order.estimatedTime);
        }
      }, 1000);
      
      return () => clearInterval(intervalId);
    } else if (order.completedAt && order.startedAt) {
      // For completed orders, show the final time
      setElapsedTime(formatElapsedTime(order.startedAt, order.completedAt));
    }
  }, [order]);
  
  // Handle status change
  const handleStatusChange = async (newStatus: OrderStatus) => {
    await updateOrderStatus(order.id, newStatus);
  };
  
  // Handle print label
  const handlePrint = async () => {
    await printLabel(order.id);
  };
  
  // Determine card classes based on status and priority
  const cardClasses = `
    order-card relative
    ${order.isPriority ? 'order-card-urgent' : ''}
    ${isOverdue && order.status !== 'done' ? 'alert-overdue' : ''}
  `;
  
  // Map status to badge
  const statusBadges = {
    queued: <Badge className="status-badge status-queued">Queued</Badge>,
    baking: <Badge className="status-badge status-baking">Baking</Badge>,
    done: <Badge className="status-badge status-done">Done</Badge>
  };
  
  // Extract details from notes
  const extractOrderDetails = (notes: string) => {
    const flavorMatch = notes.match(/^([^,]+) flavor/i);
    const flavor = flavorMatch ? flavorMatch[1] : 'Custom';
    return flavor;
  };
  
  // Get the order title from notes
  const orderTitle = extractOrderDetails(order.notes);
  
  return (
    <Card className={cardClasses}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg">{orderTitle}</h3>
            <div className="flex items-center text-sm text-muted-foreground gap-2">
              <span>{order.notes}</span>
              {order.isPriority && (
                <Flag className="h-4 w-4 text-bakery-danger" />
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            {statusBadges[order.status]}
            <div className="mt-1 flex items-center">
              <Printer className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span className="print-badge">{order.printCount}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center mb-3 text-sm">
          <Clock className="h-4 w-4 mr-1" />
          <div>
            <span className={`font-medium ${isOverdue && order.status !== 'done' ? 'text-bakery-danger' : ''}`}>
              {elapsedTime}
            </span>
            <span className="mx-1 text-muted-foreground">/</span>
            <span className="text-muted-foreground">Est. {order.estimatedTime} min</span>
          </div>
        </div>
        
        {displayActions && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-muted-foreground">
              Created: {formatDateTime(order.createdAt)}
            </div>
            
            <div className="flex gap-2">
              {/* Status change buttons */}
              {user?.role === 'baker' && (
                <>
                  {order.status === 'queued' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleStatusChange('baking')}
                    >
                      Start Baking
                    </Button>
                  )}
                  {order.status === 'baking' && (
                    <Button 
                      size="sm"
                      variant="outline" 
                      className="text-xs"
                      onClick={() => handleStatusChange('done')}
                    >
                      Mark Done
                    </Button>
                  )}
                </>
              )}
              
              {/* Print button */}
              <Button 
                size="sm" 
                variant="secondary"
                className="text-xs"
                onClick={handlePrint}
              >
                <Printer className="h-3 w-3 mr-1" />
                Print
              </Button>
              
              {/* Details link */}
              <Button asChild size="sm" variant="default" className="text-xs">
                <Link to={`/orders/${order.id}`}>
                  Details
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
