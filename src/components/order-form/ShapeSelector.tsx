
import React from 'react';
import { Circle, Square, PenTool } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CakeShape } from '@/types/orders';

const BowlIcon = ({ className }: { className?: string }) => (
  <img 
    src="/lovable-uploads/6dc45a33-f429-4a07-838d-5da53e335451.png" 
    alt="Bowl" 
    className={className || "w-8 h-8"} 
  />
);

interface ShapeSelectorProps {
  shape: CakeShape;
  onShapeChange: (value: CakeShape) => void;
}

const ShapeSelector: React.FC<ShapeSelectorProps> = ({ shape, onShapeChange }) => {
  return (
    <div className="space-y-2">
      <Label>Shape</Label>
      <RadioGroup 
        className="grid grid-cols-2 gap-4 md:grid-cols-4" 
        value={shape}
        onValueChange={(value) => onShapeChange(value as CakeShape)}
      >
        <div>
          <RadioGroupItem value="round" id="round" className="sr-only" />
          <Label 
            htmlFor="round" 
            className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${shape === 'round' ? 'border-primary bg-primary/10' : ''}`}
          >
            <Circle className="w-8 h-8 mb-2" />
            <span className="mt-2">Round</span>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem value="square" id="square" className="sr-only" />
          <Label 
            htmlFor="square"
            className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${shape === 'square' ? 'border-primary bg-primary/10' : ''}`}
          >
            <Square className="w-8 h-8 mb-2" />
            <span className="mt-2">Square</span>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem value="bowl" id="bowl" className="sr-only" />
          <Label 
            htmlFor="bowl" 
            className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${shape === 'bowl' ? 'border-primary bg-primary/10' : ''}`}
          >
            <BowlIcon className="w-8 h-8 mb-2" />
            <span className="mt-2">Bowl</span>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem value="custom" id="custom" className="sr-only" />
          <Label 
            htmlFor="custom" 
            className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${shape === 'custom' ? 'border-primary bg-primary/10' : ''}`}
          >
            <PenTool className="w-8 h-8 mb-2" />
            <span className="mt-2">Custom</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ShapeSelector;
