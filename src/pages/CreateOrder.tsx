
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useOrders } from '@/contexts/OrderContext';
import OrderForm from '@/components/order-form/OrderForm';
import OrderSuccessDialog from '@/components/order-form/OrderSuccessDialog';
import { NewOrderInput } from '@/types/orders';

const CreateOrder = () => {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  
  const handleSubmit = async (orderData: NewOrderInput) => {
    setIsSubmitting(true);
    try {
      await createOrder(orderData);
      setShowSuccessDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setShowSuccessDialog(false);
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
        
        <OrderForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/')}
        />
      </div>

      <OrderSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        onReset={handleReset}
      />
    </Layout>
  );
};

export default CreateOrder;
