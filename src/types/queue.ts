
export type CakeFlavor = 'vanilla' | 'chocolate';
export type CakeShape = 'round' | 'square' | 'custom' | 'bowl';

export interface MockData {
  dailyCompleted: number;
  dailyTarget: number;
  pendingOrders: PendingOrder[];
  activeMixing: ActiveMixing[];
  ovenReady: OvenReadyBatch[];
  ovens: Oven[];
  completedBatches: CompletedBatch[];
}

export interface PendingOrder {
  id: string;
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedQuantity: number;
  producedQuantity: number;
  requestedAt: Date;
  isPriority: boolean;
  notes?: string;
}

export interface ActiveMixing {
  id: string;
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedAt: Date;
  isPriority: boolean;
  startTime?: Date;
  requestedQuantity: number;
  producedQuantity: number;
  notes?: string;
}

export interface OvenReadyBatch {
  id: string;
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  batchLabel: string;
  requestedQuantity: number;
  producedQuantity: number;
  requestedAt: Date;
  isPriority: boolean;
}

export interface Oven {
  number: number;
  isActive: boolean;
  timeRemaining?: number;
  currentBatch?: {
    id: string;
    batchLabel: string;
    flavor: CakeFlavor;
    producedQuantity: number;
  };
  batches: {
    id: string;
    batchLabel: string;
    flavor: CakeFlavor;
    shape: CakeShape;
    size: number;
    producedQuantity: number;
  }[];
}

export interface CompletedBatch {
  id: string;
  batchLabel: string;
  flavor: CakeFlavor;
  shape: CakeShape;
  size: number;
  producedQuantity: number;
  completedAt: Date;
}
