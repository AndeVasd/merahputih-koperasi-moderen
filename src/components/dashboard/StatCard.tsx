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

const variantStyles = {
  default: {
    card: 'bg-card border border-border',
    icon: 'bg-primary/10 text-primary',
    title: 'text-muted-foreground',
    value: 'text-foreground',
    subtitle: 'text-muted-foreground',
  },
  primary: {
    card: 'bg-gradient-to-br from-primary to-primary/80 border-none shadow-lg shadow-primary/20',
    icon: 'bg-white/20 text-white',
    title: 'text-white/80',
    value: 'text-white',
    subtitle: 'text-white/60',
  },
  accent: {
    card: 'bg-gradient-to-br from-accent to-accent/80 border-none shadow-lg shadow-accent/20',
    icon: 'bg-white/20 text-white',
    title: 'text-white/80',
    value: 'text-white',
    subtitle: 'text-white/60',
  },
  success: {
    card: 'bg-gradient-to-br from-success to-success/80 border-none shadow-lg shadow-success/20',
    icon: 'bg-white/20 text-white',
    title: 'text-white/80',
    value: 'text-white',
    subtitle: 'text-white/60',
  },
  warning: {
    card: 'bg-gradient-to-br from-warning to-warning/80 border-none shadow-lg shadow-warning/20',
    icon: 'bg-white/20 text-white',
    title: 'text-white/80',
    value: 'text-white',
    subtitle: 'text-white/60',
  },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-fade-in',
      styles.card
    )}>
      {/* Decorative circle */}
      {variant !== 'default' && (
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      )}
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn('text-xs font-semibold uppercase tracking-wider', styles.title)}>
            {title}
          </p>
          <p className={cn(
            'font-extrabold tracking-tight break-words',
            typeof value === 'string' && value.length > 12 ? 'text-base lg:text-xl' : 'text-2xl',
            styles.value
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn('text-xs font-medium', styles.subtitle)}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5',
              trend.isPositive 
                ? 'bg-success/20 text-success' 
                : 'bg-destructive/20 text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl',
          styles.icon
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
