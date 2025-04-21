// Order status types
export type OrderStatus = 'queued' | 'baking' | 'done' | 'mixing';

// Cake specifications
export type CakeFlavor = 'vanilla' | 'chocolate';
export type CakeShape = 'round' | 'square' | 'custom' | 'bowl';

// Manual Baker Order interface (renamed from Order)
export interface ManualBakerOrder {
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
  orders: ManualBakerOrder[];
  getOrderById: (id: string) => ManualBakerOrder | undefined;
  createOrder: (orderData: NewOrderInput) => Promise<ManualBakerOrder>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<boolean>;
  printLabel: (id: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  isLoading: boolean;
  reorderQueue: (orderId: string, newPosition: number) => void;
  updateOrderQuantity: (id: string, delta: number) => Promise<void>;
  updateOrderNotes: (id: string, notes: string) => Promise<void>;
  refresh?: () => Promise<void>;
}

// For backwards compatibility - keeping the Order type as alias to ManualBakerOrder
export type Order = ManualBakerOrder;
