
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
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const handleSubmit = async (orderData: NewOrderInput) => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      console.log("Submitting order data:", orderData);
      await createOrder(orderData);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error creating order:', error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setShowSuccessDialog(false);
    setErrorMessage("");
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
          errorMessage={errorMessage}
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
