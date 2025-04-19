
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (delta: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onQuantityChange }) => {
  return (
    <div className="space-y-2">
      <Label>Quantity</Label>
      <div className="flex items-center space-x-4">
        <Button 
          type="button"
          variant="outline" 
          size="icon"
          onClick={() => onQuantityChange(-1)}
          disabled={quantity <= 1}
        >
          <Minus className="h-5 w-5" />
        </Button>
        
        <span className="text-3xl font-bold w-12 text-center">{quantity}</span>
        
        <Button 
          type="button"
          variant="outline" 
          size="icon"
          onClick={() => onQuantityChange(1)}
          disabled={quantity >= 100}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default QuantitySelector;
