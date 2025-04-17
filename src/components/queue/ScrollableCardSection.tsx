
import React from 'react';
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
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {React.Children.map(children, (child) => (
            <CarouselItem className="pl-4 md:basis-auto min-w-[240px]">
              {child}
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full z-10">
          <CarouselPrevious className="relative -left-2" />
          <CarouselNext className="relative -right-2" />
        </div>
      </Carousel>
    </div>
  );
};

export default ScrollableCardSection;
