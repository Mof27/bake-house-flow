
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface LogEntry {
  id: string;
  timestamp: Date;
  batchId: string;
  action: string;
  details: string;
  type: 'quantity' | 'status' | 'mixing' | 'oven';
  producedQuantity?: number;
  requestedQuantity?: number;
}

const Logs: React.FC = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [dailyCompleted, setDailyCompleted] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(20);

  // Load logs from Supabase
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        // Get logs from Supabase
        const { data, error } = await supabase
          .from('logs')
          .select('*')
          .order('timestamp', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Transform data to match our LogEntry interface
          const transformedLogs = data.map((log: any) => ({
            id: log.id,
            timestamp: new Date(log.timestamp),
            batchId: log.batch_id,
            action: log.action,
            details: log.details,
            type: log.type as 'quantity' | 'status' | 'mixing' | 'oven',
            producedQuantity: log.produced_quantity,
            requestedQuantity: log.requested_quantity
          }));
          setLogEntries(transformedLogs);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();

    // Also fetch daily statistics from orders
    const fetchDailyStats = async () => {
      try {
        // Count completed orders for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'done')
          .gte('completed_at', today.toISOString());
        
        if (error) {
          throw error;
        }

        // Set daily completed count from database
        if (count !== null) {
          setDailyCompleted(count);
        }
      } catch (error) {
        console.error('Error fetching daily stats:', error);
      }
    };

    fetchDailyStats();

    // Set up real-time subscription for logs
    const channel = supabase
      .channel('logs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, (payload) => {
        // Refresh logs when data changes
        fetchLogs();
        fetchDailyStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLogs = activeTab === 'all' 
    ? logEntries 
    : logEntries.filter(log => log.type === activeTab);
  
  // Group logs by date for better organization
  const groupedLogs: Record<string, LogEntry[]> = {};
  filteredLogs.forEach(log => {
    const dateKey = format(new Date(log.timestamp), 'yyyy-MM-dd');
    if (!groupedLogs[dateKey]) {
      groupedLogs[dateKey] = [];
    }
    groupedLogs[dateKey].push(log);
  });

  // Sort dates in reverse chronological order
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Layout 
      sidebar={<Sidebar dailyCompleted={dailyCompleted} dailyTarget={dailyTarget} />}
      title="Production Logs"
    >
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Production Activity Logs</h1>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Activities</TabsTrigger>
            <TabsTrigger value="quantity">Quantity Changes</TabsTrigger>
            <TabsTrigger value="status">Status Changes</TabsTrigger>
            <TabsTrigger value="mixing">Mixing Operations</TabsTrigger>
            <TabsTrigger value="oven">Oven Operations</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {activeTab === 'all' ? 'All Activities' : 
                   activeTab === 'quantity' ? 'Quantity Adjustments' :
                   activeTab === 'status' ? 'Status Changes' :
                   activeTab === 'mixing' ? 'Mixing Operations' : 'Oven Operations'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-250px)]">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
                    </div>
                  ) : sortedDates.length > 0 ? (
                    sortedDates.map(dateKey => (
                      <div key={dateKey} className="mb-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          {format(new Date(dateKey), 'EEEE, MMM d, yyyy')}
                        </h3>
                        <div className="space-y-3">
                          {groupedLogs[dateKey]
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((log) => (
                              <div key={log.id} className="border rounded-md p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={
                                        log.type === 'quantity' ? 'outline' :
                                        log.type === 'status' ? 'secondary' :
                                        log.type === 'mixing' ? 'default' : 'destructive'
                                      }
                                    >
                                      {log.type}
                                    </Badge>
                                    <span className="font-mono text-sm">{log.batchId}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(log.timestamp), 'HH:mm:ss')}
                                  </span>
                                </div>
                                <p className="text-sm font-medium">{log.action}</p>
                                <p className="text-sm text-muted-foreground">{log.details}</p>
                                {log.type === 'quantity' && log.producedQuantity !== undefined && (
                                  <div className="mt-2 text-xs">
                                    <span>Requested: {log.requestedQuantity} </span>
                                    <span className="mx-2">→</span>
                                    <span>Produced: {log.producedQuantity}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No log entries found for this category.
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Logs;
