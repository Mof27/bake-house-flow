
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Layout from '@/components/Layout';
import { useOrders, NewOrderInput, ComplexityLevel } from '@/contexts/OrderContext';

const CreateOrder: React.FC = () => {
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<NewOrderInput>({
    defaultValues: {
      designName: '',
      complexity: 3 as ComplexityLevel,
      isPriority: false,
      notes: '',
    }
  });
  
  // Watch the complexity field
  const complexity = watch('complexity');
  const isPriority = watch('isPriority');
  
  // Handle form submission
  const onSubmit = async (data: NewOrderInput) => {
    try {
      const order = await createOrder(data);
      toast.success(`Order created: ${data.designName}`);
      navigate('/'); // Redirect to dashboard
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
              <div className="space-y-2">
                <Label htmlFor="designName">Design Name</Label>
                <Input
                  id="designName"
                  placeholder="Enter the design name"
                  {...register('designName', { required: 'Design name is required' })}
                  className="h-12"
                />
                {errors.designName && (
                  <p className="text-sm text-destructive">{errors.designName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Complexity Level</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={complexity === level ? "default" : "outline"}
                      className="flex-1 text-xl"
                      onClick={() => setValue('complexity', level as ComplexityLevel)}
                    >
                      {Array(level).fill('★').join('')}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Select complexity from 1 (simple) to 5 (complex)
                </p>
              </div>
              
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
