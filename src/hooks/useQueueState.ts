import { useState } from 'react';
import { MockData, PendingOrder } from '@/types/queue';

export const useQueueState = () => {
  const generateRequestDate = () => {
    const now = new Date();
    const hoursAgo = Math.random() * 5;
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
        batchLabel: 'ROUND VANILLA 16CM',
        requestedQuantity: 4,
        producedQuantity: 4,
        requestedAt: generateRequestDate(),
        isPriority: true,
        isNew: true,
        notes: 'Birthday cake for Sarah'
      },
      {
        id: '2',
        flavor: 'chocolate',
        shape: 'square',
        size: 20,
        batchLabel: 'SQUARE CHOCOLATE 20CM',
        requestedQuantity: 2,
        producedQuantity: 2,
        requestedAt: generateRequestDate(),
        isPriority: false
      },
      {
        id: '3',
        flavor: 'vanilla',
        shape: 'round',
        size: 18,
        batchLabel: 'ROUND VANILLA 18CM',
        requestedQuantity: 3,
        producedQuantity: 3,
        requestedAt: generateRequestDate(),
        isPriority: true
      },
      {
        id: '4',
        flavor: 'chocolate',
        shape: 'square',
        size: 22,
        batchLabel: 'SQUARE CHOCOLATE 22CM',
        requestedQuantity: 5,
        producedQuantity: 5,
        requestedAt: generateRequestDate(),
        isPriority: false
      },
      {
        id: '5',
        flavor: 'vanilla',
        shape: 'round',
        size: 20,
        batchLabel: 'ROUND VANILLA 20CM',
        requestedQuantity: 2,
        producedQuantity: 2,
        requestedAt: generateRequestDate(),
        isPriority: true
      },
      {
        id: '6',
        flavor: 'chocolate',
        shape: 'square',
        size: 16,
        batchLabel: 'SQUARE CHOCOLATE 16CM',
        requestedQuantity: 4,
        producedQuantity: 4,
        requestedAt: generateRequestDate(),
        isPriority: false
      },
      {
        id: '7',
        flavor: 'vanilla',
        shape: 'round',
        size: 22,
        batchLabel: 'ROUND VANILLA 22CM',
        requestedQuantity: 3,
        producedQuantity: 3,
        requestedAt: generateRequestDate(),
        isPriority: true
      },
      {
        id: '8',
        flavor: 'chocolate',
        shape: 'square',
        size: 18,
        batchLabel: 'SQUARE CHOCOLATE 18CM',
        requestedQuantity: 5,
        producedQuantity: 5,
        requestedAt: generateRequestDate(),
        isPriority: false
      },
      {
        id: '9',
        flavor: 'vanilla',
        shape: 'round',
        size: 16,
        batchLabel: 'ROUND VANILLA 16CM',
        requestedQuantity: 2,
        producedQuantity: 2,
        requestedAt: generateRequestDate(),
        isPriority: true
      },
      {
        id: '10',
        flavor: 'chocolate',
        shape: 'square',
        size: 20,
        batchLabel: 'SQUARE CHOCOLATE 20CM',
        requestedQuantity: 4,
        producedQuantity: 4,
        requestedAt: generateRequestDate(),
        isPriority: false
      }
    ],
    activeMixing: [
      {
        id: '3',
        flavor: 'vanilla',
        shape: 'round',
        size: 18,
        batchLabel: 'ROUND VANILLA 18CM',
        requestedAt: generateRequestDate(),
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
        batchLabel: 'ROUND CHOCOLATE 22CM',
        requestedQuantity: 5,
        producedQuantity: 5,
        requestedAt: generateRequestDate(),
        isPriority: true
      },
      {
        id: '8',
        flavor: 'vanilla',
        shape: 'square',
        size: 16,
        batchLabel: 'SQUARE VANILLA 16CM',
        requestedQuantity: 2,
        producedQuantity: 2,
        requestedAt: generateRequestDate(),
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
          batchLabel: 'ROUND VANILLA 18CM',
          flavor: 'vanilla',
          producedQuantity: 3
        },
        batches: [
          {
            id: '5',
            batchLabel: 'ROUND VANILLA 18CM',
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
        batchLabel: 'SQUARE VANILLA 20CM',
        flavor: 'vanilla',
        shape: 'square',
        size: 20,
        producedQuantity: 4,
        completedAt: generateRequestDate()
      },
      {
        id: '11',
        batchLabel: 'ROUND CHOCOLATE 18CM',
        flavor: 'chocolate',
        shape: 'round',
        size: 18,
        producedQuantity: 3,
        completedAt: generateRequestDate()
      },
      {
        id: '12',
        batchLabel: 'SQUARE CHOCOLATE 22CM',
        flavor: 'chocolate',
        shape: 'square',
        size: 22,
        producedQuantity: 6,
        completedAt: generateRequestDate()
      }
    ]
  });

  return {
    mockData,
    setMockData,
    generateRequestDate
  };
};
