
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, Printer, Flag, Clock, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Layout from '@/components/Layout';
import { useOrders, Order, OrderStatus } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderById, updateOrderStatus, printLabel, deleteOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (id) {
      const orderData = getOrderById(id);
      if (orderData) {
        setOrder(orderData);
      } else {
        toast.error('Order not found');
        navigate('/');
      }
    }
  }, [id, getOrderById, navigate]);
  
  // Format elapsed time as MM:SS
  const formatElapsedTime = (startTime: Date, endTime: Date = new Date()) => {
    const diffMs = endTime.getTime() - new Date(startTime).getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Update elapsed time every second
  useEffect(() => {
    if (!order) return;
    
    if (order.status !== 'done') {
      const intervalId = setInterval(() => {
        const startTime = order.startedAt || order.createdAt;
        setElapsedTime(formatElapsedTime(startTime));
      }, 1000);
      
      return () => clearInterval(intervalId);
    } else if (order.completedAt && order.startedAt) {
      setElapsedTime(formatElapsedTime(order.startedAt, order.completedAt));
    }
  }, [order]);
  
  // Format date as readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle status change
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || !id) return;
    
    setIsSubmitting(true);
    try {
      await updateOrderStatus(id, newStatus);
      // Refresh order data
      const updatedOrder = getOrderById(id);
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle print label
  const handlePrint = async () => {
    if (!order || !id) return;
    
    setIsSubmitting(true);
    try {
      await printLabel(id);
      // Refresh order data
      const updatedOrder = getOrderById(id);
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
      toast.success('Label printed successfully');
    } catch (error) {
      toast.error('Failed to print label');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete order
  const handleDelete = async () => {
    if (!order || !id) return;
    
    setIsSubmitting(true);
    try {
      await deleteOrder(id);
      toast.success('Order deleted');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete order');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!order) {
    return (
      <Layout title="Order Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </Layout>
    );
  }
  
  // Map status to badge
  const statusBadges = {
    queued: <Badge className="status-badge status-queued">Queued</Badge>,
    baking: <Badge className="status-badge status-baking">Baking</Badge>,
    done: <Badge className="status-badge status-done">Done</Badge>
  };
  
  // Check if order is overdue
  const isOverdue = () => {
    if (order.status === 'done') return false;
    
    const startTime = order.startedAt || order.createdAt;
    const elapsedMinutes = (new Date().getTime() - new Date(startTime).getTime()) / 60000;
    return elapsedMinutes > order.estimatedTime;
  };
  
  const overdueWarning = isOverdue() && (
    <div className="bg-destructive/10 text-destructive p-3 rounded-md mt-4 flex items-center">
      <Clock className="h-5 w-5 mr-2" />
      <span className="font-medium">Order is overdue!</span>
    </div>
  );
  
  // Extract order title from notes
  const extractOrderTitle = (notes: string) => {
    const flavorMatch = notes.match(/^([^,]+) flavor/i);
    return flavorMatch ? `${flavorMatch[1]} Order` : 'Custom Order';
  };
  
  return (
    <Layout title="Order Details">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        
        <Card className={`${order.isPriority ? 'border-l-4 border-l-bakery-danger' : ''}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{extractOrderTitle(order.notes)}</h2>
                {order.isPriority && (
                  <Badge variant="outline" className="text-bakery-danger border-bakery-danger mt-1">
                    <Flag className="h-3.5 w-3.5 mr-1" />
                    Rush Order
                  </Badge>
                )}
              </div>
              <div>
                {statusBadges[order.status]}
              </div>
            </div>
            
            {overdueWarning}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h3 className="font-medium mb-2">Order Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  {order.startedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Started:</span>
                      <span>{formatDate(order.startedAt)}</span>
                    </div>
                  )}
                  {order.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span>{formatDate(order.completedAt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Print Count:</span>
                    <div className="flex items-center">
                      <Printer className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span className="print-badge">{order.printCount}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Time Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Time:</span>
                    <span>{order.estimatedTime} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Elapsed Time:</span>
                    <span 
                      className={isOverdue() && order.status !== 'done' ? 'text-destructive font-medium' : ''}
                    >
                      {elapsedTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {order.notes && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Notes</h3>
                <div className="bg-muted/50 p-3 rounded-md text-sm">
                  {order.notes}
                </div>
              </div>
            )}
          </CardContent>
          
          <Separator />
          
          <CardFooter className="p-6 flex flex-wrap gap-2 justify-end">
            {user?.role === 'baker' && (
              <>
                {order.status === 'queued' && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('baking')}
                    disabled={isSubmitting}
                  >
                    Start Baking
                  </Button>
                )}
                {order.status === 'baking' && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('done')}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Done
                  </Button>
                )}
              </>
            )}
            
            <Button
              variant="secondary"
              onClick={handlePrint}
              disabled={isSubmitting}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Label
            </Button>
            
            {user?.role === 'leader' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <X className="h-4 w-4 mr-2" />
                    Delete Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      order and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderDetails;
