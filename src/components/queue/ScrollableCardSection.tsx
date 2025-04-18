
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CakeFlavor } from '@/types/queue';

interface ScrollableCardSectionProps {
  children: React.ReactNode;
  title: string;
  selectedFlavor?: CakeFlavor | 'all';
  onFlavorChange?: (flavor: CakeFlavor | 'all') => void;
  showFilters?: boolean;
}

const ScrollableCardSection: React.FC<ScrollableCardSectionProps> = ({ 
  children, 
  title,
  selectedFlavor = 'all',
  onFlavorChange,
  showFilters = false
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
  
  return (
    <div className="mb-4 relative">
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">{title}</h2>
          {showFilters && (
            <ToggleGroup 
              type="single" 
              value={selectedFlavor}
              onValueChange={(value) => onFlavorChange?.(value as CakeFlavor | 'all')}
              className="gap-1"
            >
              <ToggleGroupItem value="all" aria-label="Show all flavors" className="text-xs">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="vanilla" aria-label="Show vanilla only" className="text-xs">
                Vanilla
              </ToggleGroupItem>
              <ToggleGroupItem value="chocolate" aria-label="Show chocolate only" className="text-xs">
                Chocolate
              </ToggleGroupItem>
            </ToggleGroup>
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
        className="flex gap-1 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
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
        
        {/* Add a small dummy element to ensure the last card can be fully scrolled into view */}
        <div className="shrink-0 w-4"></div>
      </div>
    </div>
  );
};

export default ScrollableCardSection;
