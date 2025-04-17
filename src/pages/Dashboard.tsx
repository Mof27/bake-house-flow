
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import Layout from '@/components/Layout';
import OrderCard from '@/components/OrderCard';

const Dashboard: React.FC = () => {
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState<'all' | 'queued' | 'baking' | 'done'>('all');
  
  // Filter orders based on active tab
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);
  
  // Count orders by status
  const queuedCount = orders.filter(order => order.status === 'queued').length;
  const bakingCount = orders.filter(order => order.status === 'baking').length;
  const doneCount = orders.filter(order => order.status === 'done').length;
  
  return (
    <Layout title="Bakery Dashboard">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Order Queue</h2>
        <div className="flex space-x-2">
          <Button asChild className="flex items-center">
            <Link to="/new-order">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all" className="text-lg py-2">
              All ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="queued" className="text-lg py-2">
              Queued ({queuedCount})
            </TabsTrigger>
            <TabsTrigger value="baking" className="text-lg py-2">
              Baking ({bakingCount})
            </TabsTrigger>
            <TabsTrigger value="done" className="text-lg py-2">
              Done ({doneCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid gap-4">
              {filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No orders available
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="queued" className="mt-0">
            <div className="grid gap-4">
              {filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No queued orders
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="baking" className="mt-0">
            <div className="grid gap-4">
              {filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No orders in progress
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="done" className="mt-0">
            <div className="grid gap-4">
              {filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No completed orders
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
