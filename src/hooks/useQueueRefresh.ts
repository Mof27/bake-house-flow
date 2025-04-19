
import { toast } from 'sonner';
import { MockData } from '@/types/queue';

export const useQueueRefresh = (mockData: MockData, setMockData: React.Dispatch<React.SetStateAction<MockData>>) => {
  const fetchLatestData = () => {
    toast.success("Data refreshed successfully", {
      description: "Latest queue data has been loaded",
      position: "top-right",
    });
    
    console.log("Refreshing data...");
    
    const updatedData = {
      ...mockData,
      pendingOrders: mockData.pendingOrders.map(order => ({
        ...order,
        requestedAt: order.isPriority ? new Date() : order.requestedAt
      }))
    };
    
    setMockData(updatedData);
  };

  return { fetchLatestData };
};
