
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CakeFlavor, CakeShape, NewOrderInput } from '@/types/orders';
import ShapeSelector from './ShapeSelector';
import SizeSelector from './SizeSelector';
import QuantitySelector from './QuantitySelector';
import FlavorSelector from './FlavorSelector';
import PriorityToggle from './PriorityToggle';

interface OrderFormProps {
  onSubmit: (orderData: NewOrderInput) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, isSubmitting, onCancel }) => {
  const [shape, setShape] = useState<CakeShape>('round');
  const [size, setSize] = useState<number>(18);
  const [width, setWidth] = useState<number>(20);
  const [length, setLength] = useState<number>(30);
  const [quantity, setQuantity] = useState<number>(1);
  const [flavor, setFlavor] = useState<CakeFlavor>('vanilla');
  const [notes, setNotes] = useState<string>('');
  const [priority, setPriority] = useState<boolean>(false);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    let finalShape: CakeShape = shape;
    let finalSize = size;
    
    if (shape === 'custom') {
      finalSize = Math.max(width, length);
    }
    
    const orderInput: NewOrderInput = {
      isPriority: priority,
      flavor: flavor,
      shape: finalShape,
      size: finalSize,
      requestedQuantity: quantity,
      notes: notes
    };
    
    await onSubmit(orderInput);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Cake Order</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ShapeSelector shape={shape} onShapeChange={setShape} />
          
          <SizeSelector
            shape={shape}
            size={size}
            width={width}
            length={length}
            onSizeChange={setSize}
            onWidthChange={setWidth}
            onLengthChange={setLength}
          />
          
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
          />
          
          <PriorityToggle
            priority={priority}
            onPriorityChange={setPriority}
          />
          
          <FlavorSelector
            flavor={flavor}
            onFlavorChange={setFlavor}
          />
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Instructions</Label>
            <Textarea
              id="notes"
              placeholder="Add any special instructions here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Order'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderForm;
