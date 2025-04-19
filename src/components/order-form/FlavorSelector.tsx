
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CakeFlavor } from '@/types/orders';

interface FlavorSelectorProps {
  flavor: CakeFlavor;
  onFlavorChange: (flavor: CakeFlavor) => void;
}

const FlavorSelector: React.FC<FlavorSelectorProps> = ({ flavor, onFlavorChange }) => {
  return (
    <div className="space-y-2">
      <Label>Flavor</Label>
      <div className="grid grid-cols-2 gap-4">
        <Button 
          type="button"
          variant={flavor === 'vanilla' ? 'default' : 'outline'}
          className={`h-16 ${flavor === 'vanilla' ? 'bg-amber-50 text-amber-900 border-amber-200' : ''}`}
          onClick={() => onFlavorChange('vanilla')}
        >
          <span className="text-xl">Vanilla</span>
        </Button>
        
        <Button 
          type="button"
          variant={flavor === 'chocolate' ? 'default' : 'outline'}
          className={`h-16 ${flavor === 'chocolate' ? 'bg-amber-900 text-amber-50 border-amber-700' : ''}`}
          onClick={() => onFlavorChange('chocolate')}
        >
          <span className="text-xl">Chocolate</span>
        </Button>
      </div>
    </div>
  );
};

export default FlavorSelector;
