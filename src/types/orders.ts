
// Order status types
export type OrderStatus = 'queued' | 'baking' | 'done' | 'mixing';

// Order interface
export interface Order {
  id: string;
  isPriority: boolean;
  status: OrderStatus;
  estimatedTime: number;
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
  isPriority: boolean;
  notes: string;
}

export interface OrderContextType {
  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  createOrder: (orderData: NewOrderInput) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  printLabel: (id: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  isLoading: boolean;
  reorderQueue: (orderId: string, newPosition: number) => void;
  updateOrderQuantity: (id: string, delta: number) => Promise<void>;
  updateOrderNotes: (id: string, notes: string) => Promise<void>;
}
