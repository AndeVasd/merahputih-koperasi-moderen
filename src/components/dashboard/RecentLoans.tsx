import { Loan, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/koperasi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentLoansProps {
  loans: Loan[];
  onViewReceipt: (loan: Loan) => void;
}

const statusStyles = {
  active: 'bg-primary/10 text-primary border-primary/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusLabels = {
  active: 'Aktif',
  paid: 'Lunas',
  overdue: 'Jatuh Tempo',
};

export function RecentLoans({ loans, onViewReceipt }: RecentLoansProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loans.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center animate-fade-in">
        <p className="text-muted-foreground">Belum ada pinjaman</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-in">
      <div className="divide-y divide-border">
        {loans.map((loan, index) => (
          <div
            key={loan.id}
            className="flex items-center justify-between p-3 lg:p-4 hover:bg-secondary/50 transition-colors"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-lg bg-primary/10 text-lg lg:text-xl flex-shrink-0">
                {CATEGORY_ICONS[loan.category]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-foreground truncate">{loan.memberName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {CATEGORY_LABELS[loan.category]} • {formatDate(loan.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0 ml-2">
              <div className="text-right">
                <p className="font-semibold text-xs lg:text-sm text-foreground">{formatCurrency(loan.totalAmount)}</p>
                <Badge variant="outline" className={cn('text-xs hidden sm:inline-flex', statusStyles[loan.status])}>
                  {statusLabels[loan.status]}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewReceipt(loan)}
                className="hover:bg-primary/10 hover:text-primary h-8 w-8"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
