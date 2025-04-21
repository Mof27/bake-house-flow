
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type LogType = 'quantity' | 'status' | 'mixing' | 'oven';

interface LogEntry {
  batch_id: string;
  action: string;
  details: string;
  type: LogType;
  produced_quantity?: number;
  requested_quantity?: number;
  created_by?: string | null;
}

export const useLogging = (user?: User) => {
  const logActivity = async (logEntry: LogEntry) => {
    try {
      // Add user ID if available
      const entry = {
        ...logEntry,
        created_by: user?.id || null
      };

      // Insert into logs table
      const { error } = await supabase.from('logs').insert(entry);

      if (error) {
        console.error('Error logging activity:', error);
        toast.error('Failed to log activity');
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Unexpected error logging activity:', err);
      return false;
    }
  };

  return { logActivity };
};
