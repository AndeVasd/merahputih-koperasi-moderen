import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
}

const variants = {
  default: 'bg-card',
  primary: 'gradient-primary text-primary-foreground',
  accent: 'gradient-accent text-accent-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const isColored = variant !== 'default';

  return (
    <div className={cn(
      'rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg animate-fade-in',
      variants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            'text-sm font-medium',
            isColored ? 'text-current opacity-80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className={cn(
            'mt-2 text-3xl font-bold',
            isColored ? 'text-current' : 'text-foreground'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              'mt-1 text-sm',
              isColored ? 'text-current opacity-70' : 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              'mt-2 flex items-center text-sm',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className={cn(
                'ml-1',
                isColored ? 'text-current opacity-60' : 'text-muted-foreground'
              )}>
                vs bulan lalu
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl',
          isColored ? 'bg-white/20' : 'bg-primary/10'
        )}>
          <Icon className={cn(
            'h-6 w-6',
            isColored ? 'text-current' : 'text-primary'
          )} />
        </div>
      </div>
    </div>
  );
}
