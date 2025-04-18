import { useState } from 'react';
import { MockData, PendingOrder } from '@/types/queue';

export const useQueueState = () => {
  const generateRecentDate = () => {
    const now = new Date();
    const minutesAgo = Math.random() * 4; // Random time between 0-4 minutes ago
    now.setMinutes(now.getMinutes() - minutesAgo);
    return now;
  };

  const generateOlderDate = () => {
    const now = new Date();
    const hoursAgo = Math.random() * 5; // Random time between 0-5 hours ago
    now.setHours(now.getHours() - hoursAgo);
    return now;
  };

  const [mockData, setMockData] = useState<MockData>({
    dailyCompleted: 12,
    dailyTarget: 20,
    pendingOrders: [
      {
        id: '1',
        flavor: 'vanilla',
        shape: 'round',
        size: 16,
        batchLabel: 'A001',
        requestedQuantity: 4,
        producedQuantity: 4,
        requestedAt: generateRecentDate(), // New order (< 5 mins)
        isPriority: true,
        notes: 'Birthday cake for Sarah'
      },
      {
        id: '2',
        flavor: 'chocolate',
        shape: 'square',
        size: 20,
        batchLabel: 'A002',
        requestedQuantity: 2,
        producedQuantity: 2,
        requestedAt: generateRecentDate(), // New order (< 5 mins)
        isPriority: false
      },
      {
        id: '3',
        flavor: 'vanilla',
        shape: 'round',
        size: 18,
        batchLabel: 'A003',
        requestedQuantity: 3,
        producedQuantity: 3,
        requestedAt: generateOlderDate(),
        isPriority: true
      },
      {
        id: '4',
        flavor: 'chocolate',
        shape: 'square',
        size: 22,
        batchLabel: 'A004',
        requestedQuantity: 5,
        producedQuantity: 5,
        requestedAt: generateOlderDate(),
        isPriority: false
      },
      {
        id: '5',
        flavor: 'vanilla',
        shape: 'round',
        size: 20,
        batchLabel: 'A005',
        requestedQuantity: 2,
        producedQuantity: 2,
        requestedAt: generateOlderDate(),
        isPriority: true
      },
      {
        id: '6',
        flavor: 'chocolate',
        shape: 'square',
        size: 16,
        batchLabel: 'A006',
        requestedQuantity: 4,
        producedQuantity: 4,
        requestedAt: generateOlderDate(),
        isPriority: false
      },
      {
        id: '7',
        flavor: 'vanilla',
        shape: 'round',
        size: 22,
        batchLabel: 'A007',
        requestedQuantity: 3,
        producedQuantity: 3,
        requestedAt: generateOlderDate(),
        isPriority: true
      },
      {
        id: '8',
        flavor: 'chocolate',
        shape: 'square',
        size: 18,
        batchLabel: 'A008',
        requestedQuantity: 5,
        producedQuantity: 5,
        requestedAt: generateOlderDate(),
        isPriority: false
      },
      {
        id: '9',
        flavor: 'vanilla',
        shape: 'round',
        size: 16,
        batchLabel: 'A009',
        requestedQuantity: 2,
        producedQuantity: 2,
        requestedAt: generateOlderDate(),
        isPriority: true
      },
      {
        id: '10',
        flavor: 'chocolate',
        shape: 'square',
        size: 20,
        batchLabel: 'A010',
        requestedQuantity: 4,
        producedQuantity: 4,
        requestedAt: generateOlderDate(),
        isPriority: false
      }
    ],
    activeMixing: [
      {
        id: '3',
        flavor: 'vanilla',
        shape: 'round',
        size: 18,
        batchLabel: 'A003',
        requestedAt: generateOlderDate(),
        isPriority: false,
        startTime: new Date()
      }
    ],
    ovenReady: [
      {
        id: '4',
        flavor: 'chocolate',
        shape: 'round',
        size: 22,
        batchLabel: 'A004',
        requestedQuantity: 5,
        producedQuantity: 5,
        requestedAt: generateOlderDate(),
        isPriority: true
      },
      {
        id: '8',
        flavor: 'vanilla',
        shape: 'square',
        size: 16,
        batchLabel: 'A008',
        requestedQuantity: 2,
        producedQuantity: 2,
        requestedAt: generateOlderDate(),
        isPriority: false
      }
    ],
    ovens: [
      {
        number: 1,
        isActive: true,
        timeRemaining: 1250,
        currentBatch: {
          id: '5',
          batchLabel: 'A003',
          flavor: 'vanilla',
          producedQuantity: 3
        },
        batches: [
          {
            id: '5',
            batchLabel: 'A003',
            flavor: 'vanilla',
            shape: 'round',
            size: 18,
            producedQuantity: 3
          }
        ]
      },
      {
        number: 2,
        isActive: false,
        batches: []
      }
    ],
    completedBatches: [
      {
        id: '10',
        batchLabel: 'A010',
        flavor: 'vanilla',
        shape: 'square',
        size: 20,
        producedQuantity: 4,
        completedAt: generateOlderDate()
      },
      {
        id: '11',
        batchLabel: 'A002',
        flavor: 'chocolate',
        shape: 'round',
        size: 18,
        producedQuantity: 3,
        completedAt: generateOlderDate()
      },
      {
        id: '12',
        batchLabel: 'A004',
        flavor: 'chocolate',
        shape: 'square',
        size: 22,
        producedQuantity: 6,
        completedAt: generateOlderDate()
      }
    ]
  });

  return {
    mockData,
    setMockData
  };
};
