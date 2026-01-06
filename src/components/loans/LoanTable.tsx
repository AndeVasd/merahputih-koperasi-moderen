import { Loan, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/koperasi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Printer, MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LoanTableProps {
  loans: Loan[];
  onViewReceipt: (loan: Loan) => void;
  onPrint: (loan: Loan) => void;
  onUpdateStatus?: (loanId: string, status: 'active' | 'paid' | 'overdue') => void;
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

export function LoanTable({ loans, onViewReceipt, onPrint, onUpdateStatus }: LoanTableProps) {
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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead className="font-semibold">No. Transaksi</TableHead>
            <TableHead className="font-semibold">Anggota</TableHead>
            <TableHead className="font-semibold">Kategori</TableHead>
            <TableHead className="font-semibold">Tanggal</TableHead>
            <TableHead className="font-semibold">Jatuh Tempo</TableHead>
            <TableHead className="font-semibold text-right">Jumlah</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.map((loan, index) => (
            <TableRow
              key={loan.id}
              className="hover:bg-secondary/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="font-mono font-medium">{loan.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{loan.memberName}</p>
                  <p className="text-xs text-muted-foreground">ID: {loan.memberId}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[loan.category]}</span>
                  <span className="text-sm">{CATEGORY_LABELS[loan.category]}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(loan.createdAt)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(loan.dueDate)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(loan.totalAmount)}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('text-xs', statusStyles[loan.status])}>
                  {statusLabels[loan.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewReceipt(loan)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Struk
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPrint(loan)}>
                      <Printer className="h-4 w-4 mr-2" />
                      Cetak Struk
                    </DropdownMenuItem>
                    {onUpdateStatus && (
                      <>
                        <DropdownMenuSeparator />
                        {loan.status !== 'paid' && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateStatus(loan.id, 'paid')}
                            className="text-success"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Tandai Lunas
                          </DropdownMenuItem>
                        )}
                        {loan.status !== 'active' && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateStatus(loan.id, 'active')}
                            className="text-primary"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Tandai Aktif
                          </DropdownMenuItem>
                        )}
                        {loan.status !== 'overdue' && (
                          <DropdownMenuItem 
                            onClick={() => onUpdateStatus(loan.id, 'overdue')}
                            className="text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Tandai Jatuh Tempo
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
