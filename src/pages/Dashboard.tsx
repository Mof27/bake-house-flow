import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import Layout from '@/components/Layout';
import OrderCard from '@/components/OrderCard';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle, Loader2, Clock, ListOrdered } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import OrderStatsChart from '@/components/OrderStatsChart';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const { hasNewOrders, newOrdersCount, markNewOrdersSeen } = useNotifications();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (hasNewOrders) {
      markNewOrdersSeen();
    }
  }, [hasNewOrders, markNewOrdersSeen]);
  
  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'done').length;
  const inProgressOrders = orders.filter(order => order.status === 'baking').length;
  const queuedOrders = orders.filter(order => order.status === 'queued').length;
  
  return (
    <Layout title="Dashboard">
      <div className="grid gap-4 md:gap-8 mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/queue')}
              className="gap-2"
            >
              <ListOrdered className="h-5 w-5" />
              <span>View Queue</span>
              {hasNewOrders && (
                <Badge variant="destructive" className="ml-1">
                  {newOrdersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Orders"
            value={totalOrders}
            icon={Package}
            description="All time orders"
          />
          <StatCard
            title="Completed"
            value={completedOrders}
            icon={CheckCircle}
            description="Successfully delivered"
          />
          <StatCard
            title="In Progress"
            value={inProgressOrders}
            icon={Loader2}
            description="Currently in production"
          />
          <StatCard
            title="In Queue"
            value={queuedOrders}
            icon={Clock}
            description="Waiting to be processed"
          />
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Manage your recent cake orders</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/queue')}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-[120px] items-center justify-center">
                <div className="text-center">
                  <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-2 font-medium">No orders yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Orders will appear here once created
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Order Statistics</CardTitle>
            <CardDescription>Overview of order trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <OrderStatsChart orders={orders} />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
