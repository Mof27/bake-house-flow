
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface ScrollableCardSectionProps {
  children: React.ReactNode;
  title: string;
}

const ScrollableCardSection: React.FC<ScrollableCardSectionProps> = ({ children, title }) => {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          dragFree: true
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {React.Children.map(children, (child) => (
            <CarouselItem className="pl-2 md:pl-4 basis-[240px]">
              {child}
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
};

export default ScrollableCardSection;
