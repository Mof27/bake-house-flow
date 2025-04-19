import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { useOrders, NewOrderInput } from '@/contexts/OrderContext';

const CreateOrder: React.FC = () => {
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<NewOrderInput>({
    defaultValues: {
      isPriority: false,
      notes: '',
    }
  });
  
  const isPriority = watch('isPriority');
  
  const onSubmit = async (data: NewOrderInput) => {
    try {
      await createOrder(data);
      toast.success('Order created successfully');
      navigate('/queue'); // Navigate to queue page after creating order
    } catch (error) {
      toast.error('Failed to create order');
      console.error(error);
    }
  };

  return (
    <Layout title="Create New Order">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPriority"
                  checked={isPriority}
                  onCheckedChange={(checked) => setValue('isPriority', checked)}
                />
                <Label htmlFor="isPriority" className="text-base font-medium">
                  Rush Order (High Priority)
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Special instructions or requirements"
                  {...register('notes')}
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="px-6"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="px-6" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Order'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateOrder;
