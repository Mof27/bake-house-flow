
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Order, NewOrderInput, OrderStatus } from '@/types/orders';
import { estimateBakeTime, updateOrdersArray } from '@/utils/orderUtils';
import { User } from '@/contexts/AuthContext';

export const useOrderOperations = (user: User) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getOrderById = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  const createOrder = async (orderData: NewOrderInput): Promise<Order> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const estimatedTime = estimateBakeTime();
    
    const newOrder: Order = {
      id: uuidv4(),
      isPriority: orderData.isPriority,
      status: 'queued',
      estimatedTime,
      assignedTo: null,
      createdBy: user.id,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      printCount: 1,
      notes: orderData.notes
    };
    
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    setIsLoading(false);
    
    console.log('Printing label for new order:', newOrder.id);
    toast.success(`Order created`);
    return newOrder;
  };

  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setOrders(prevOrders => 
      updateOrdersArray(prevOrders, id, order => {
        const updatedOrder = { ...order, status };
        
        if (status === 'baking' && !order.startedAt) {
          updatedOrder.startedAt = new Date();
          updatedOrder.assignedTo = user?.id || null;
        }
        
        if (status === 'done' && !order.completedAt) {
          updatedOrder.completedAt = new Date();
          const totalTime = updatedOrder.completedAt.getTime() - order.createdAt.getTime();
          const timeInMinutes = Math.round(totalTime / (1000 * 60));
          console.log(`Order ${id} completed in ${timeInMinutes} minutes. Estimated: ${order.estimatedTime} minutes.`);
        }
        
        return updatedOrder;
      })
    );
    
    setIsLoading(false);
    toast.success(`Order status updated to ${status}`);
  };

  const printLabel = async (id: string): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOrders(prevOrders => 
      updateOrdersArray(prevOrders, id, order => ({
        ...order,
        printCount: order.printCount + 1
      }))
    );
    
    setIsLoading(false);
    console.log('Printing label for order:', id);
    toast.success('Label printed successfully');
  };

  const deleteOrder = async (id: string): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
    setIsLoading(false);
    toast.success('Order deleted');
  };

  const reorderQueue = (orderId: string, newPosition: number) => {
    const ordersCopy = [...orders];
    const orderIndex = ordersCopy.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return;
    
    const orderToMove = ordersCopy[orderIndex];
    const filteredOrders = ordersCopy.filter(o => o.status === orderToMove.status);
    
    filteredOrders.splice(orderIndex, 1);
    filteredOrders.splice(newPosition, 0, orderToMove);
    
    const otherOrders = ordersCopy.filter(o => o.status !== orderToMove.status);
    setOrders([...filteredOrders, ...otherOrders]);
    
    toast.success('Order queue updated');
  };

  const updateOrderQuantity = async (id: string, delta: number): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setOrders(prevOrders => 
      updateOrdersArray(prevOrders, id, order => {
        const quantityMatch = order.notes.match(/Quantity: (\d+)/i);
        let quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
        quantity = Math.max(1, quantity + delta);
        
        return {
          ...order,
          notes: order.notes.replace(/Quantity: \d+/i, `Quantity: ${quantity}`)
        };
      })
    );
    
    setIsLoading(false);
    toast.success(`Order quantity updated`);
  };

  const updateOrderNotes = async (id: string, notes: string): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setOrders(prevOrders => 
      updateOrdersArray(prevOrders, id, order => ({
        ...order,
        notes
      }))
    );
    
    setIsLoading(false);
    toast.success(`Order notes updated`);
  };

  return {
    orders,
    isLoading,
    getOrderById,
    createOrder,
    updateOrderStatus,
    printLabel,
    deleteOrder,
    reorderQueue,
    updateOrderQuantity,
    updateOrderNotes
  };
};
