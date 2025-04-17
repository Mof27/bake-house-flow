
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description 
}) => {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h2 className="text-3xl font-bold">{value}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-6 w-6 text-foreground/80" />
        </div>
      </CardContent>
    </Card>
  );
};
