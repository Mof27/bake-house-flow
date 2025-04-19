
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const STANDARD_SIZES = [12, 16, 18, 22, 25, 35];

interface SizeSelectorProps {
  shape: 'round' | 'square' | 'custom' | 'bowl';
  size: number;
  width: number;
  length: number;
  onSizeChange: (size: number) => void;
  onWidthChange: (width: number) => void;
  onLengthChange: (length: number) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  shape,
  size,
  width,
  length,
  onSizeChange,
  onWidthChange,
  onLengthChange,
}) => {
  const findClosestSize = (value: number) => {
    return STANDARD_SIZES.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  };
  
  const handleSizeChange = (value: number[]) => {
    const closestSize = findClosestSize(value[0]);
    onSizeChange(closestSize);
  };

  if (shape === 'custom') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width (cm)</Label>
          <Input
            id="width"
            type="number"
            min={10}
            max={100}
            value={width}
            onChange={(e) => onWidthChange(parseInt(e.target.value) || 20)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="length">Length (cm)</Label>
          <Input
            id="length"
            type="number"
            min={10}
            max={100}
            value={length}
            onChange={(e) => onLengthChange(parseInt(e.target.value) || 30)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Size</Label>
        <span className="font-bold text-xl">{size} cm</span>
      </div>
      
      <div className="px-4">
        <Slider
          value={[size]}
          min={10}
          max={37}
          step={1}
          onValueChange={handleSizeChange}
          className="py-4"
        />
      </div>
      
      <div className="flex justify-between text-sm px-4">
        {STANDARD_SIZES.map((s) => (
          <div 
            key={s} 
            className={`cursor-pointer ${size === s ? 'font-bold text-primary' : 'text-muted-foreground'}`}
            onClick={() => onSizeChange(s)}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
