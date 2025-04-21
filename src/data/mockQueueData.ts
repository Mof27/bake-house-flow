
import { MockData } from '@/types/queue';

export const initialMockData: MockData = {
  dailyCompleted: 0, // Will be populated from Supabase
  dailyTarget: 20,   // Default target
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
