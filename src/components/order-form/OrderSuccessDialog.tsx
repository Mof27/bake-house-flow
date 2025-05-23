
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
  orderId?: string;
}

const OrderSuccessDialog: React.FC<OrderSuccessDialogProps> = ({
  open,
  onOpenChange,
  onReset,
  orderId
}) => {
  const navigate = useNavigate();

  const handleViewQueue = () => {
    // First trigger a refresh event to ensure data is up-to-date
    const refreshEvent = new CustomEvent('queue-refresh-requested', {
      detail: { orderId }
    });
    window.dispatchEvent(refreshEvent);
    
    // Then navigate to queue with parameters to show newest orders
    setTimeout(() => {
      // Add timestamp to force the component to re-render completely
      navigate('/queue?showNewest=true&timestamp=' + Date.now(), { replace: true });
      
      // Add another refresh after navigation is complete
      setTimeout(() => {
        const refreshEvent = new CustomEvent('queue-refresh-requested');
        window.dispatchEvent(refreshEvent);
      }, 500);
    }, 300);
  };

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
            onClick={handleViewQueue}
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
