
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  variant = 'default',
  className,
}) => {
  return (
    <div
      className={cn(
        "relative p-6 rounded-xl card-shadow inner-border overflow-hidden transition-all",
        "animate-scale-in flex flex-col h-full",
        variant === 'default' && "bg-white dark:bg-gray-800",
        variant === 'primary' && "bg-primary/10 dark:bg-primary/20",
        variant === 'secondary' && "bg-secondary dark:bg-secondary/80",
        variant === 'outline' && "bg-transparent border border-border dark:border-gray-700",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          variant === 'primary' 
            ? "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-foreground" 
            : "bg-secondary text-primary/80 dark:bg-secondary/70 dark:text-primary-foreground"
        )}>
          <Icon size={16} />
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
