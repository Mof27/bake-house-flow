
import { useState, useEffect } from 'react';
import { initialMockData } from '@/data/mockQueueData';
import { useQueueUpdates } from './useQueueUpdates';
import { useQueueRefresh } from './useQueueRefresh';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MockData } from '@/types/queue';

export const useQueueState = () => {
  // Use localStorage as a fallback if Supabase data isn't available
  const savedData = localStorage.getItem('queueState');
  const initialState = savedData ? JSON.parse(savedData) : initialMockData;
  
  const [isLoading, setIsLoading] = useState(true);
  const { mockData, setMockData } = useQueueUpdates(initialState);
  const { fetchLatestData } = useQueueRefresh(mockData, setMockData);
  
  // On mount, try to fetch data from Supabase
  useEffect(() => {
    const fetchQueueData = async () => {
      try {
        // This is a placeholder for future Supabase implementation
        // When you set up the tables, you'll populate from Supabase here
        
        // For now, we'll just use the empty initialMockData
        setMockData(initialMockData);
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        toast.error('Failed to load queue data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQueueData();
  }, []);
  
  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('queueState', JSON.stringify(mockData));
  }, [mockData]);

  return {
    mockData,
    setMockData,
    fetchLatestData,
    isLoading
  };
};
