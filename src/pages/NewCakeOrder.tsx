
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusCircle, MinusCircle, ChevronLeft, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Layout from '@/components/Layout';

// Predefined sizes for different shapes
const STANDARD_SIZES = [12, 16, 18, 22, 25, 35];

// Function to generate a batch label: {size} cm | {VC/DC} | {DDMMM-HH:MM}
const generateBatchLabel = (size: string, flavor: string) => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase().substring(0, 3);
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  const flavorCode = flavor === 'vanilla' ? 'VC' : 'DC';
  
  return `${size} cm | ${flavorCode} | ${day}${month}-${time}`;
};

const NewCakeOrder = () => {
  const navigate = useNavigate();
  
  // State for form fields
  const [shape, setShape] = useState<'round' | 'square' | 'bowl' | 'custom'>('round');
  const [size, setSize] = useState<number>(18); // Default to 18cm
  const [width, setWidth] = useState<number>(20);
  const [length, setLength] = useState<number>(30);
  const [quantity, setQuantity] = useState<number>(1);
  const [flavor, setFlavor] = useState<'vanilla' | 'chocolate'>('vanilla');
  const [notes, setNotes] = useState<string>('');
  const [priority, setPriority] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  
  // Handle quantity change with constraints
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity);
    }
  };
  
  // Find the closest standard size
  const findClosestSize = (value: number) => {
    return STANDARD_SIZES.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  };
  
  // Handle size slider change
  const handleSizeChange = (value: number[]) => {
    const closestSize = findClosestSize(value[0]);
    setSize(closestSize);
  };
  
  // Toggle priority status
  const togglePriority = () => {
    setPriority(!priority);
  };

  // Reset form to create a new order
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
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Determine dimensions based on shape
      let dimensions: string;
      if (shape === 'custom') {
        dimensions = `${width}×${length}`;
      } else {
        dimensions = `${size}`;
      }
      
      // Generate batch label
      const batchLabel = generateBatchLabel(dimensions, flavor);
      
      // Create order data
      const orderData = {
        id: crypto.randomUUID(),
        shape: shape === 'custom' ? 'rectangle' : shape,
        flavor,
        size: shape === 'custom' ? Math.max(width, length) : size,
        requestedQuantity: quantity,
        producedQuantity: 0,
        batchLabel,
        requestedAt: new Date(),
        isPriority: priority,
        notes,
      };
      
      console.log('New order created:', orderData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show success dialog instead of auto-redirecting
      setShowSuccessDialog(true);
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout title="New Cake Order">
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
              {/* Shape Selection */}
              <div className="space-y-2">
                <Label>Shape</Label>
                <RadioGroup 
                  className="grid grid-cols-2 gap-4 md:grid-cols-4" 
                  value={shape}
                  onValueChange={(value) => setShape(value as any)}
                >
                  <div>
                    <RadioGroupItem value="round" id="round" className="sr-only" />
                    <Label 
                      htmlFor="round" 
                      className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${shape === 'round' ? 'border-primary bg-primary/10' : ''}`}
                    >
                      <span className="text-3xl">⚪</span>
                      <span className="mt-2">Round</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="square" id="square" className="sr-only" />
                    <Label 
                      htmlFor="square"
                      className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${shape === 'square' ? 'border-primary bg-primary/10' : ''}`}
                    >
                      <span className="text-3xl">⬛</span>
                      <span className="mt-2">Square</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="bowl" id="bowl" className="sr-only" />
                    <Label 
                      htmlFor="bowl" 
                      className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${shape === 'bowl' ? 'border-primary bg-primary/10' : ''}`}
                    >
                      <span className="text-3xl">🥣</span>
                      <span className="mt-2">Bowl</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem value="custom" id="custom" className="sr-only" />
                    <Label 
                      htmlFor="custom" 
                      className={`flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground ${shape === 'custom' ? 'border-primary bg-primary/10' : ''}`}
                    >
                      <span className="text-3xl">▭</span>
                      <span className="mt-2">Custom</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Size Selection */}
              {shape !== 'custom' ? (
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
                        onClick={() => setSize(s)}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      min={10}
                      max={100}
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value) || 20)}
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
                      onChange={(e) => setLength(parseInt(e.target.value) || 30)}
                    />
                  </div>
                </div>
              )}
              
              {/* Quantity */}
              <div className="space-y-2">
                <Label>Quantity</Label>
                <div className="flex items-center space-x-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <MinusCircle className="h-5 w-5" />
                  </Button>
                  
                  <span className="text-3xl font-bold w-12 text-center">{quantity}</span>
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 100}
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Priority Toggle */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Button 
                  type="button" 
                  variant={priority ? "priority" : "outline"}
                  className={`w-full ${!priority ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}`}
                  onClick={togglePriority}
                >
                  <Flag className={`h-5 w-5 mr-2 ${priority ? 'fill-white' : 'fill-red-200'}`} />
                  {priority ? 'Priority Order' : 'Make Priority Order'}
                </Button>
              </div>
              
              {/* Flavor */}
              <div className="space-y-2">
                <Label>Flavor</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    type="button"
                    variant={flavor === 'vanilla' ? 'default' : 'outline'}
                    className={`h-16 ${flavor === 'vanilla' ? 'bg-amber-50 text-amber-900 border-amber-200' : ''}`}
                    onClick={() => setFlavor('vanilla')}
                  >
                    <span className="text-xl">Vanilla</span>
                  </Button>
                  
                  <Button 
                    type="button"
                    variant={flavor === 'chocolate' ? 'default' : 'outline'}
                    className={`h-16 ${flavor === 'chocolate' ? 'bg-amber-900 text-amber-50 border-amber-700' : ''}`}
                    onClick={() => setFlavor('chocolate')}
                  >
                    <span className="text-xl">Chocolate</span>
                  </Button>
                </div>
              </div>
              
              {/* Notes */}
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

      {/* Success Dialog */}
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

// Simple check icon component for success dialog
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

export default NewCakeOrder;
