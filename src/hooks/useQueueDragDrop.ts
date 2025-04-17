
import { useState } from 'react';
import { MockData } from '@/types/queue';
import { toast } from 'sonner';

export const useQueueDragDrop = (mockData: MockData, setMockData: React.Dispatch<React.SetStateAction<MockData>>) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (ovenNumber: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItemId) return;

    const draggedOrder = mockData.ovenReady.find(order => order.id === draggedItemId);
    if (!draggedOrder) return;

    setMockData(prev => {
      const targetOven = prev.ovens.find(oven => oven.number === ovenNumber);
      if (!targetOven) return prev;

      let updatedOvens;

      if (!targetOven.isActive) {
        updatedOvens = prev.ovens.map(oven => {
          if (oven.number === ovenNumber) {
            return {
              ...oven,
              isActive: true,
              timeRemaining: 1680,
              currentBatch: {
                id: draggedOrder.id,
                batchLabel: draggedOrder.batchLabel,
                flavor: draggedOrder.flavor,
                producedQuantity: draggedOrder.producedQuantity
              },
              batches: [
                ...oven.batches,
                {
                  id: draggedOrder.id,
                  batchLabel: draggedOrder.batchLabel,
                  flavor: draggedOrder.flavor,
                  shape: draggedOrder.shape,
                  size: draggedOrder.size,
                  producedQuantity: draggedOrder.producedQuantity
                }
              ]
            };
          }
          return oven;
        });
      } else {
        updatedOvens = prev.ovens.map(oven => {
          if (oven.number === ovenNumber) {
            return {
              ...oven,
              batches: [
                ...oven.batches,
                {
                  id: draggedOrder.id,
                  batchLabel: draggedOrder.batchLabel,
                  flavor: draggedOrder.flavor,
                  shape: draggedOrder.shape,
                  size: draggedOrder.size,
                  producedQuantity: draggedOrder.producedQuantity
                }
              ]
            };
          }
          return oven;
        });
      }

      return {
        ...prev,
        ovenReady: prev.ovenReady.filter(order => order.id !== draggedItemId),
        ovens: updatedOvens
      };
    });

    setDraggedItemId(null);
  };

  return {
    draggedItemId,
    handleDragStart,
    handleDragOver,
    handleDrop
  };
};
