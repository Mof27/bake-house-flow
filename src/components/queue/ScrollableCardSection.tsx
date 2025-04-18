
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Layers, Disc, Coffee, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CakeFlavor } from '@/types/queue';

interface ScrollableCardSectionProps {
  children: React.ReactNode;
  title: string;
  selectedFlavor?: CakeFlavor | 'all';
  onFlavorChange?: (flavor: CakeFlavor | 'all') => void;
  showFilters?: boolean;
  showPriorityFilter?: boolean;
  isPriorityOnly?: boolean;
  onPriorityChange?: (isPriority: boolean) => void;
}

const ScrollableCardSection: React.FC<ScrollableCardSectionProps> = ({ 
  children, 
  title,
  selectedFlavor = 'all',
  onFlavorChange,
  showFilters = false,
  showPriorityFilter = false,
  isPriorityOnly = false,
  onPriorityChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };
  
  const handlePriorityToggle = () => {
    if (onPriorityChange) {
      onPriorityChange(!isPriorityOnly);
    }
  };
  
  return (
    <div className="mb-4 relative">
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">{title}</h2>
          {showFilters && (
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
                  onClick={handlePriorityToggle}
                  className="gap-2 data-[state=on]:bg-red-500 data-[state=on]:text-white"
                >
                  <Star className="h-4 w-4" />
                  <span>Priority</span>
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 rounded-full" 
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8 rounded-full" 
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-0 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
        }}
      >
        {React.Children.map(children, (child) => (
          <div className="shrink-0 snap-start" style={{ minWidth: '220px' }}>
            {child}
          </div>
        ))}
        
        <div className="shrink-0 w-4"></div>
      </div>
    </div>
  );
};

export default ScrollableCardSection;

