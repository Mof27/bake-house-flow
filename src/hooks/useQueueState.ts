
import { useState, useEffect } from 'react';
import { initialMockData } from '@/data/mockQueueData';
import { useQueueUpdates } from './useQueueUpdates';
import { useQueueRefresh } from './useQueueRefresh';

export const useQueueState = () => {
  // Use localStorage to persist data if available
  const savedData = localStorage.getItem('queueState');
  const initialState = savedData ? JSON.parse(savedData) : initialMockData;
  
  const { mockData, setMockData } = useQueueUpdates(initialState);
  const { fetchLatestData } = useQueueRefresh(mockData, setMockData);
  
  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('queueState', JSON.stringify(mockData));
  }, [mockData]);

  return {
    mockData,
    setMockData,
    fetchLatestData
  };
};
