
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth, User } from './AuthContext';

// Define order status types
export type OrderStatus = 'queued' | 'baking' | 'done';

// Define complexity level (1-5)
export type ComplexityLevel = 1 | 2 | 3 | 4 | 5;

// Order interface
export interface Order {
  id: string;
  designName: string;
  complexity: ComplexityLevel;
  isPriority: boolean;
  status: OrderStatus;
  estimatedTime: number; // in minutes
  assignedTo: string | null;
  createdBy: string;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  printCount: number;
  notes: string;
}

// Interface for creating a new order
export interface NewOrderInput {
  designName: string;
  complexity: ComplexityLevel;
  isPriority: boolean;
  notes: string;
}

interface OrderContextType {
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  createOrder: (orderData: NewOrderInput) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  printLabel: (id: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  isLoading: boolean;
  reorderQueue: (orderId: string, newPosition: number) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Mock orders for demo
const generateMockOrders = (): Order[] => {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  
  return [
    {
      id: uuidv4(),
      designName: 'Birthday Cake',
      complexity: 3,
      isPriority: true,
      status: 'baking',
      estimatedTime: 45,
      assignedTo: '2',
      createdBy: '1',
      createdAt: twoHoursAgo,
      startedAt: hourAgo,
      completedAt: null,
      printCount: 2,
      notes: 'Custom birthday message: "Happy 30th, Sarah!"'
    },
    {
      id: uuidv4(),
      designName: 'Sourdough Bread',
      complexity: 2,
      isPriority: false,
      status: 'queued',
      estimatedTime: 30,
      assignedTo: '3',
      createdBy: '1',
      createdAt: hourAgo,
      startedAt: null,
      completedAt: null,
      printCount: 1,
      notes: 'Extra crispy crust'
    },
    {
      id: uuidv4(),
      designName: 'Wedding Cupcakes',
      complexity: 4,
      isPriority: true,
      status: 'queued',
      estimatedTime: 60,
      assignedTo: null,
      createdBy: '1',
      createdAt: now,
      startedAt: null,
      completedAt: null,
      printCount: 1,
      notes: 'Vanilla and chocolate mix, 24 units'
    },
    {
      id: uuidv4(),
      designName: 'Chocolate Croissants',
      complexity: 3,
      isPriority: false,
      status: 'done',
      estimatedTime: 40,
      assignedTo: '2',
      createdBy: '1',
      createdAt: twoHoursAgo,
      startedAt: twoHoursAgo,
      completedAt: hourAgo,
      printCount: 3,
      notes: 'Use premium chocolate'
    }
  ];
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(generateMockOrders());
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // AI time estimator function
  const estimateBakeTime = (complexity: ComplexityLevel): number => {
    // Base time (in minutes) + complexity factor
    // This is a simple rule-based estimator that could be replaced with ML model
    const baseTime = 20;
    const complexityFactor = complexity * 5;
    return baseTime + complexityFactor;
    
    // TODO: Future ML implementation would go here
    // The model would be trained on the collected data of actual completion times
    // stored in a TimeLog table with order details, complexity, and durations
  };

  // Function to get order by ID
  const getOrderById = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  // Function to create a new order
  const createOrder = async (orderData: NewOrderInput): Promise<Order> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!user) {
      throw new Error('User must be authenticated to create an order');
    }
    
    const estimatedTime = estimateBakeTime(orderData.complexity);
    
    const newOrder: Order = {
      id: uuidv4(),
      designName: orderData.designName,
      complexity: orderData.complexity,
      isPriority: orderData.isPriority,
      status: 'queued',
      estimatedTime,
      assignedTo: null,
      createdBy: user.id,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      printCount: 1,  // Auto-print on creation
      notes: orderData.notes
    };
    
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    setIsLoading(false);
    
    // Simulate printing label on creation
    console.log('Printing label for new order:', newOrder.id);
    
    toast.success(`Order created: ${orderData.designName}`);
    return newOrder;
  };

  // Function to update order status
  const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === id) {
          const updatedOrder = { ...order, status };
          
          // Update timestamps based on status
          if (status === 'baking' && !order.startedAt) {
            updatedOrder.startedAt = new Date();
            updatedOrder.assignedTo = user?.id || null;
          }
          
          if (status === 'done' && !order.completedAt) {
            updatedOrder.completedAt = new Date();
            
            // TODO: Here we would log completion time for ML training
            const totalTime = updatedOrder.completedAt.getTime() - order.createdAt.getTime();
            const timeInMinutes = Math.round(totalTime / (1000 * 60));
            console.log(`Order ${id} completed in ${timeInMinutes} minutes. Estimated: ${order.estimatedTime} minutes.`);
          }
          
          return updatedOrder;
        }
        return order;
      })
    );
    
    setIsLoading(false);
    toast.success(`Order status updated to ${status}`);
  };

  // Function to print order label
  const printLabel = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay and print process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === id) {
          return { ...order, printCount: order.printCount + 1 };
        }
        return order;
      })
    );
    
    setIsLoading(false);
    
    // This is where printer integration would happen
    console.log('Printing label for order:', id);
    
    /* TODO: Printer Integration
       Options include:
       1. ESC/POS USB printer using a Node.js backend
       2. Network printer via IPP protocol
       3. Cloud print service like PrintNode
       4. Browser-based printing using window.print() for PDF outputs
    */
    
    toast.success('Label printed successfully');
  };

  // Function to delete an order (for admin purposes)
  const deleteOrder = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
    
    setIsLoading(false);
    toast.success('Order deleted');
  };
  
  // Function to reorder queued orders (drag and drop)
  const reorderQueue = (orderId: string, newPosition: number) => {
    const ordersCopy = [...orders];
    const orderIndex = ordersCopy.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return;
    
    // Make sure we're only reordering within status groups
    const orderToMove = ordersCopy[orderIndex];
    const filteredOrders = ordersCopy.filter(o => o.status === orderToMove.status);
    
    // Remove the order from its position
    filteredOrders.splice(orderIndex, 1);
    
    // Insert at the new position
    filteredOrders.splice(newPosition, 0, orderToMove);
    
    // Merge back with other status orders
    const otherOrders = ordersCopy.filter(o => o.status !== orderToMove.status);
    setOrders([...filteredOrders, ...otherOrders]);
    
    toast.success('Order queue updated');
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      getOrderById,
      createOrder,
      updateOrderStatus,
      printLabel,
      deleteOrder,
      isLoading,
      reorderQueue
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

// Comment: In production, this would connect to a database via API calls.
// The database schema would include:
// - Orders table (as modeled above)
// - Users table (for authentication)
// - TimeLogs table (for ML training data)
// - PrintLogs table (for tracking print jobs)
