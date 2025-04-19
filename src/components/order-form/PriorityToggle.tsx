
import React from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface PriorityToggleProps {
  priority: boolean;
  onPriorityChange: (priority: boolean) => void;
}

const PriorityToggle: React.FC<PriorityToggleProps> = ({ priority, onPriorityChange }) => {
  return (
    <div className="space-y-2">
      <Label>Priority</Label>
      <Button 
        type="button" 
        variant={priority ? "default" : "outline"}
        className={`w-full ${priority ? 'bg-red-600 hover:bg-red-700' : 'border-red-300 text-red-600 hover:bg-red-50'}`}
        onClick={() => onPriorityChange(!priority)}
      >
        <Flag className={`h-5 w-5 mr-2 ${priority ? 'fill-white' : 'fill-red-200'}`} />
        {priority ? 'Priority Order' : 'Make Priority Order'}
      </Button>
    </div>
  );
};

export default PriorityToggle;
