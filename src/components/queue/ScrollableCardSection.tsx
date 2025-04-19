
import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CakeFlavor } from '@/types/queue';
import FilterControls from './filters/FilterControls';

interface ScrollableCardSectionProps {
  children: React.ReactNode;
  title: string;
  selectedFlavor?: CakeFlavor | 'all';
  onFlavorChange?: (flavor: CakeFlavor | 'all') => void;
  showFilters?: boolean;
  showPriorityFilter?: boolean;
  isPriorityOnly?: boolean;
  onPriorityChange?: (isPriority: boolean) => void;
  sortOrder?: 'asc' | 'desc';
  onSortOrderChange?: (order: 'asc' | 'desc') => void;
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
  sortOrder = 'asc',
  onSortOrderChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  useEffect(() => {
    const showNewest = new URLSearchParams(location.search).get('showNewest');
    
    if (showNewest === 'true' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
      
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = 0;
          console.log('Scrolled to beginning (delayed)');
        }
      }, 100);
      
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = 0;
          console.log('Scrolled to beginning (final attempt)');
        }
      }, 500);
    }
  }, [location.search, children]);
  
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
          
          {showFilters && onFlavorChange && onPriorityChange && onSortOrderChange && (
            <FilterControls
              selectedFlavor={selectedFlavor}
              onFlavorChange={onFlavorChange}
              showPriorityFilter={showPriorityFilter}
              isPriorityOnly={isPriorityOnly}
              onPriorityChange={onPriorityChange}
              sortOrder={sortOrder}
              onSortOrderChange={onSortOrderChange}
            />
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
