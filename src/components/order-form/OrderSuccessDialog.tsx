
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface OrderSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
}

const OrderSuccessDialog: React.FC<OrderSuccessDialogProps> = ({
  open,
  onOpenChange,
  onReset,
}) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => navigate('/queue')} // Changed to navigate to queue page
          >
            View Queue
          </Button>
          <Button 
            className="sm:flex-1" 
            onClick={onReset}
          >
            Create Another Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

export default OrderSuccessDialog;
