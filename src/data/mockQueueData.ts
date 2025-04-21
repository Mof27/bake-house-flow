
import { MockData } from '@/types/queue';

export const initialMockData: MockData = {
  dailyCompleted: 0,
  dailyTarget: 20,
  pendingOrders: [],
  activeMixing: [],
  ovenReady: [],
  ovens: [
    {
      number: 1,
      isActive: false,
      batches: []
    },
    {
      number: 2,
      isActive: false,
      batches: []
    }
  ],
  completedBatches: []
};
