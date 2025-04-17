
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useOrders, Order } from './OrderContext';

interface NotificationContextType {
  hasNewOrders: boolean;
  hasOverdueOrders: boolean;
  newOrdersCount: number;
  overdueOrdersCount: number;
  markNewOrdersSeen: () => void;
  playNotificationSound: (type: 'new' | 'overdue') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { orders } = useOrders();
  const [lastSeenOrderTime, setLastSeenOrderTime] = useState<Date>(new Date());
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [hasOverdueOrders, setHasOverdueOrders] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [overdueOrdersCount, setOverdueOrdersCount] = useState(0);

  // Audio elements for notifications
  const newOrderSound = new Audio('/notification-sounds/new-order.mp3'); // This would be added to public folder
  const overdueSound = new Audio('/notification-sounds/overdue.mp3'); // This would be added to public folder

  // Mock these audio files with console logs for now
  const playNotificationSound = (type: 'new' | 'overdue') => {
    if (type === 'new') {
      console.log('Playing new order notification sound');
      // newOrderSound.play();
    } else {
      console.log('Playing overdue notification sound');
      // overdueSound.play();
    }
  };

  // Check for new orders
  useEffect(() => {
    const newOrders = orders.filter(order => 
      new Date(order.createdAt) > lastSeenOrderTime
    );
    
    setNewOrdersCount(newOrders.length);
    
    if (newOrders.length > 0 && !hasNewOrders) {
      setHasNewOrders(true);
      toast.info(`${newOrders.length} new order${newOrders.length > 1 ? 's' : ''}`);
      playNotificationSound('new');
    }
  }, [orders, lastSeenOrderTime]);

  // Check for overdue orders
  useEffect(() => {
    const now = new Date();
    
    const checkIfOverdue = (order: Order): boolean => {
      if (order.status === 'done') return false;
      
      if (order.status === 'baking' && order.startedAt) {
        const elapsedMinutes = (now.getTime() - new Date(order.startedAt).getTime()) / (1000 * 60);
        return elapsedMinutes > order.estimatedTime;
      }
      
      if (order.status === 'queued') {
        const elapsedMinutes = (now.getTime() - new Date(order.createdAt).getTime()) / (1000 * 60);
        return elapsedMinutes > order.estimatedTime;
      }
      
      return false;
    };
    
    const overdueOrders = orders.filter(checkIfOverdue);
    setOverdueOrdersCount(overdueOrders.length);
    
    const previouslyOverdue = hasOverdueOrders;
    setHasOverdueOrders(overdueOrders.length > 0);
    
    if (overdueOrders.length > 0 && !previouslyOverdue) {
      toast.warning(`${overdueOrders.length} order${overdueOrders.length > 1 ? 's are' : ' is'} overdue!`);
      playNotificationSound('overdue');
    }
  }, [orders]);

  const markNewOrdersSeen = () => {
    setLastSeenOrderTime(new Date());
    setHasNewOrders(false);
    setNewOrdersCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      hasNewOrders,
      hasOverdueOrders,
      newOrdersCount,
      overdueOrdersCount,
      markNewOrdersSeen,
      playNotificationSound
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
