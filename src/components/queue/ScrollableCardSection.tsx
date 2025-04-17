
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScrollableCardSectionProps {
  children: React.ReactNode;
  title: string;
}

const ScrollableCardSection: React.FC<ScrollableCardSectionProps> = ({ children, title }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkForScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkForScrollButtons();
    window.addEventListener('resize', checkForScrollButtons);
    return () => window.removeEventListener('resize', checkForScrollButtons);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(checkForScrollButtons, 300);
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <div className="relative">
        {showLeftArrow && (
          <Button 
            variant="outline" 
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide" 
          onScroll={checkForScrollButtons}
        >
          {children}
        </div>
        
        {showRightArrow && (
          <Button 
            variant="outline" 
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ScrollableCardSection;
