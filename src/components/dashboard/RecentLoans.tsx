import { Loan, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/koperasi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Printer } from 'lucide-react';
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

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-in">
      <div className="flex items-center justify-between border-b border-border p-6">
        <h3 className="text-lg font-semibold text-foreground">Pinjaman Terbaru</h3>
        <Button variant="outline" size="sm">
          Lihat Semua
        </Button>
      </div>
      <div className="divide-y divide-border">
        {loans.map((loan, index) => (
          <div
            key={loan.id}
            className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">
                {CATEGORY_ICONS[loan.category]}
              </div>
              <div>
                <p className="font-medium text-foreground">{loan.memberName}</p>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_LABELS[loan.category]} • {formatDate(loan.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-foreground">{formatCurrency(loan.totalAmount)}</p>
                <Badge variant="outline" className={cn('text-xs', statusStyles[loan.status])}>
                  {statusLabels[loan.status]}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewReceipt(loan)}
                className="hover:bg-primary/10 hover:text-primary"
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
