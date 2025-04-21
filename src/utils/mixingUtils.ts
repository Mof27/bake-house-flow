import { ActiveMixing } from '@/types/queue';

// Interface for consolidated mixing items
export interface ConsolidatedMixingItem {
  ids: string[];
  flavor: ActiveMixing['flavor'];
  shape: ActiveMixing['shape'];
  size: number;
  batchLabels: string[];
  requestedAt: Date;
  isPriority: boolean;
  mixerNumber: number;
  totalRequestedQuantity: number;
  totalProducedQuantity: number;
}

/**
 * Consolidates mixing items with the same flavor, shape, and size
 */
export const consolidateMixingItems = (mixingItems: ActiveMixing[]): ConsolidatedMixingItem[] => {
  // Create a map to group items
  const groupedItems = new Map<string, ActiveMixing[]>();
  
  // Group items by flavor, shape, and size
  mixingItems.forEach(item => {
    // Extract mixer number from batch label
    const mixerMatch = item.batchLabel.match(/Mixer #(\d+)/);
    const mixerNumber = mixerMatch ? parseInt(mixerMatch[1]) : 1;
    
    // Create a key based on flavor, shape, size and mixer number
    const key = `${item.flavor}-${item.shape}-${item.size}-${mixerNumber}`;
    
    if (!groupedItems.has(key)) {
      groupedItems.set(key, []);
    }
    
    groupedItems.get(key)?.push(item);
  });
  
  // Convert the grouped items to consolidated items
  return Array.from(groupedItems.values()).map(items => {
    // Extract batch codes from labels and clean up mixer information
    const batchLabels = items.map(item => {
      // Clean up the mixer info but keep the batch code intact
      return item.batchLabel;
    });
    
    // Get the earliest requested time
    const earliestDate = new Date(
      Math.min(...items.map(item => new Date(item.requestedAt).getTime()))
    );
    
    // Extract mixer number from the first item's batch label
    const mixerMatch = items[0].batchLabel.match(/Mixer #(\d+)/);
    const mixerNumber = mixerMatch ? parseInt(mixerMatch[1]) : 1;
    
    // Calculate total quantities
    const totalRequestedQuantity = items.reduce((sum, item) => 
      sum + (item.requestedQuantity || 5), 0);
    const totalProducedQuantity = items.reduce((sum, item) => 
      sum + (item.producedQuantity || item.requestedQuantity || 5), 0);
    
    // Check if any item is priority
    const isPriority = items.some(item => item.isPriority);
    
    return {
      ids: items.map(item => item.id),
      flavor: items[0].flavor,
      shape: items[0].shape,
      size: items[0].size,
      batchLabels: batchLabels,
      requestedAt: earliestDate,
      isPriority,
      mixerNumber,
      totalRequestedQuantity,
      totalProducedQuantity
    };
  });
};
