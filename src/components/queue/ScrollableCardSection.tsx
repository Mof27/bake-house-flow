
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
          loop: false,
        }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {React.Children.map(children, (child) => (
            <CarouselItem className="pl-2 md:pl-4 basis-[240px] md:basis-[240px]">
              {child}
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </div>
      </Carousel>
    </div>
  );
};

export default ScrollableCardSection;
