
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Layout from '@/components/Layout';
import { useOrders, CakeFlavor, CakeShape, NewOrderInput } from '@/contexts/OrderContext';
import ShapeSelector from '@/components/order-form/ShapeSelector';
import SizeSelector from '@/components/order-form/SizeSelector';
import QuantitySelector from '@/components/order-form/QuantitySelector';
import FlavorSelector from '@/components/order-form/FlavorSelector';
import PriorityToggle from '@/components/order-form/PriorityToggle';

const CreateOrder = () => {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  
  const [shape, setShape] = useState<CakeShape>('round');
  const [size, setSize] = useState<number>(18);
  const [width, setWidth] = useState<number>(20);
  const [length, setLength] = useState<number>(30);
  const [quantity, setQuantity] = useState<number>(1);
  const [flavor, setFlavor] = useState<CakeFlavor>('vanilla');
  const [notes, setNotes] = useState<string>('');
  const [priority, setPriority] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity);
    }
  };

  const resetForm = () => {
    setShape('round');
    setSize(18);
    setWidth(20);
    setLength(30);
    setQuantity(1);
    setFlavor('vanilla');
    setNotes('');
    setPriority(false);
    setShowSuccessDialog(false);
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
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
      
      console.log('Submitting order with data:', orderInput);
      
      await createOrder(orderInput);
      
      setShowSuccessDialog(true);
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout title="Create Cake Order">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        
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
              onClick={() => navigate('/')}
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
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Created Successfully</DialogTitle>
            <DialogDescription>
              Your cake order has been added to the queue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center my-4">
            <div className="rounded-full bg-green-100 p-3">
              <div className="rounded-full bg-green-200 p-3">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button 
              variant="outline" 
              className="sm:flex-1" 
              onClick={() => navigate('/')}
            >
              Done
            </Button>
            <Button 
              className="sm:flex-1" 
              onClick={resetForm}
            >
              Create Another Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 13l4 4L19 7" 
    />
  </svg>
);

export default CreateOrder;
