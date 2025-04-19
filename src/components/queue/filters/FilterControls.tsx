
import React from 'react';
import { Layers, Disc, Coffee, Star, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CakeFlavor } from '@/types/queue';

interface FilterControlsProps {
  selectedFlavor: CakeFlavor | 'all';
  onFlavorChange: (flavor: CakeFlavor | 'all') => void;
  showPriorityFilter?: boolean;
  isPriorityOnly: boolean;
  onPriorityChange: (isPriority: boolean) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedFlavor,
  onFlavorChange,
  showPriorityFilter = false,
  isPriorityOnly,
  onPriorityChange,
  sortOrder,
  onSortOrderChange,
}) => {
  const handleSortOrderToggle = () => {
    onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex items-center gap-2">
      <ToggleGroup 
        type="single" 
        value={selectedFlavor}
        onValueChange={(value) => {
          if (value) onFlavorChange?.(value as CakeFlavor | 'all');
        }}
        className="gap-1"
      >
        <ToggleGroupItem 
          value="all" 
          aria-label="Show all flavors" 
          className="gap-2 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
        >
          <Layers className="h-4 w-4" />
          <span>All</span>
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="vanilla" 
          aria-label="Show vanilla only" 
          className="gap-2 data-[state=on]:bg-amber-200 data-[state=on]:text-amber-950"
        >
          <Disc className="h-4 w-4" />
          <span>Vanilla</span>
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="chocolate" 
          aria-label="Show chocolate only" 
          className="gap-2 data-[state=on]:bg-amber-900 data-[state=on]:text-amber-50"
        >
          <Coffee className="h-4 w-4" />
          <span>Chocolate</span>
        </ToggleGroupItem>
      </ToggleGroup>
      
      {showPriorityFilter && (
        <Button 
          variant={isPriorityOnly ? "default" : "outline"} 
          size="sm" 
          onClick={() => onPriorityChange?.(!isPriorityOnly)}
          className="gap-2"
        >
          <Star className="h-4 w-4" />
          <span>Priority</span>
        </Button>
      )}

      <div className="flex items-center gap-1 border rounded-md p-0.5">
        <Button 
          variant={sortOrder === 'asc' ? 'default' : 'outline'} 
          size="sm" 
          onClick={handleSortOrderToggle}
          className={`gap-2 transition-all duration-200 ${
            sortOrder === 'asc' 
              ? 'bg-[#9b87f5] hover:bg-[#7E69AB] text-white' 
              : 'hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <ArrowUpAZ className="h-4 w-4" />
          <span>Oldest First</span>
        </Button>
        
        <Button 
          variant={sortOrder === 'desc' ? 'default' : 'outline'} 
          size="sm" 
          onClick={handleSortOrderToggle}
          className={`gap-2 transition-all duration-200 ${
            sortOrder === 'desc' 
              ? 'bg-[#9b87f5] hover:bg-[#7E69AB] text-white' 
              : 'hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <ArrowDownAZ className="h-4 w-4" />
          <span>Newest First</span>
        </Button>
      </div>
    </div>
  );
};

export default FilterControls;
