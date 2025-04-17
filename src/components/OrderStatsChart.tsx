
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Order } from '@/contexts/OrderContext';

interface OrderStatsChartProps {
  orders: Order[];
}

const OrderStatsChart: React.FC<OrderStatsChartProps> = ({ orders }) => {
  const chartData = useMemo(() => {
    // Get today's date and the past 7 days
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - i);
      return date;
    }).reverse();

    // Format dates as strings (e.g., "Mon", "Tue", etc.)
    return dates.map(date => {
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Count orders for each status on this date
      const completed = orders.filter(
        order => {
          // Convert createdAt to string format for comparison
          const orderDate = new Date(order.createdAt);
          const orderDateStr = orderDate.toISOString().split('T')[0];
          return order.status === 'done' && orderDateStr === dateStr;
        }
      ).length;
      
      const inProgress = orders.filter(
        order => {
          const orderDate = new Date(order.createdAt);
          const orderDateStr = orderDate.toISOString().split('T')[0];
          return order.status === 'baking' && orderDateStr === dateStr;
        }
      ).length;
      
      const queued = orders.filter(
        order => {
          const orderDate = new Date(order.createdAt);
          const orderDateStr = orderDate.toISOString().split('T')[0];
          return order.status === 'queued' && orderDateStr === dateStr;
        }
      ).length;
      
      return {
        name: day,
        Completed: completed,
        "In Progress": inProgress,
        Queued: queued,
      };
    });
  }, [orders]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Completed" fill="#10b981" />
        <Bar dataKey="In Progress" fill="#3b82f6" />
        <Bar dataKey="Queued" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OrderStatsChart;
