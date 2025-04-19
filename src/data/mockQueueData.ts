import { MockData, PendingOrder } from '@/types/queue';

const generateRecentDate = () => {
  const now = new Date();
  const minutesAgo = Math.random() * 4;
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now;
};

const generateOlderDate = () => {
  const now = new Date();
  const hoursAgo = Math.random() * 5;
  now.setHours(now.getHours() - hoursAgo);
  return now;
};

export const initialMockData: MockData = {
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
      requestedAt: generateRecentDate(),
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
      requestedAt: generateRecentDate(),
      isPriority: true,
      notes: 'Urgent corporate order'
    },
    {
      id: '3',
      flavor: 'chocolate',
      shape: 'round',
      size: 18,
      batchLabel: 'A003',
      requestedQuantity: 3,
      producedQuantity: 3,
      requestedAt: generateRecentDate(),
      isPriority: false
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
    },
    {
      id: '11',
      flavor: 'chocolate',
      shape: 'round',
      size: 16,
      batchLabel: 'A011',
      requestedQuantity: 1,
      producedQuantity: 0,
      requestedAt: new Date(2024, 3, 18, 0, 3),
      isPriority: true,
      notes: 'Early morning priority order'
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
};
