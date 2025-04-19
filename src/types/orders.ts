
// Order status types
export type OrderStatus = 'queued' | 'baking' | 'done' | 'mixing';

// Cake specifications
export type CakeFlavor = 'vanilla' | 'chocolate';
export type CakeShape = 'round' | 'square' | 'custom' | 'bowl';

// Order interface
export interface Order {
  id: string;
  isPriority: boolean;
  status: OrderStatus;
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedQuantity: number;
  producedQuantity: number;
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
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  requestedQuantity: number;
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
