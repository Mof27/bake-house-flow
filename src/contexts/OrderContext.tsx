
import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useOrderOperations } from '@/hooks/useOrderOperations';
import { OrderContextType } from '@/types/orders';

export * from '@/types/orders';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const orderOperations = useOrderOperations(user);

  return (
    <OrderContext.Provider value={orderOperations}>
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
