import { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ReceiptModal } from '@/components/receipt/ReceiptModal';
import { LoanReceipt } from '@/components/receipt/LoanReceipt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Loader2, Trash2, Eye, Printer, RotateCcw } from 'lucide-react';
import { useLoanHistory } from '@/hooks/useLoanHistory';
import { Loan, LoanCategory, CATEGORY_LABELS } from '@/types/koperasi';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';

export default function LoanHistory() {
  const { loans, loading, deleteLoan, restoreLoan } = useLoanHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null);
  const [loanToPrint, setLoanToPrint] = useState<Loan | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Struk-${loanToPrint?.id}`,
    onAfterPrint: () => setLoanToPrint(null),
  });

  // Transform database loans to frontend format
  const transformedLoans: Loan[] = loans.map((loan) => ({
    id: loan.id,
    memberId: loan.member_id || '',
    memberName: loan.members?.name || loan.borrower_name || 'Unknown',
    memberNik: loan.borrower_nik || '',
    memberPhone: loan.borrower_phone || '',
    memberAddress: loan.borrower_address || '',
    ktpImageUrl: loan.ktp_image_url || undefined,
    category: loan.category as LoanCategory,
    items: (loan.loan_items || []).map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      pricePerUnit: item.price,
    })),
    totalAmount: Number(loan.total_amount),
    interestRate: Number(loan.interest_rate),
    dueDate: loan.due_date,
    createdAt: loan.created_at.split('T')[0],
    status: loan.status,
    notes: loan.notes || undefined,
  }));

  // Search filter
  const filteredLoans = transformedLoans.filter((loan) => {
    const query = searchQuery.toLowerCase();
    return (
      loan.memberName.toLowerCase().includes(query) ||
      loan.id.toLowerCase().includes(query) ||
      (loan.memberNik && loan.memberNik.toLowerCase().includes(query)) ||
      (loan.memberPhone && loan.memberPhone.toLowerCase().includes(query)) ||
      loan.category.toLowerCase().includes(query)
    );
  });

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

  const handleDelete = async () => {
    if (loanToDelete) {
      await deleteLoan(loanToDelete);
      setLoanToDelete(null);
    }
  };

  const handleRestore = async (id: string) => {
    await restoreLoan(id);
  };

  const handlePrintLoan = (loan: Loan) => {
    setLoanToPrint(loan);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const handleExport = () => {
    const csv = [
      ['No', 'ID', 'Nama', 'Kategori', 'Total', 'Bunga', 'Tanggal Lunas'],
      ...filteredLoans.map((l, i) => [
        i + 1,
        l.id,
        l.memberName,
        CATEGORY_LABELS[l.category],
        l.totalAmount,
        `${l.interestRate}%`,
        l.dueDate,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'riwayat-pinjaman.csv';
    a.click();
    toast.success('Data berhasil diekspor');
  };

  return (
    <MainLayout
      title="Riwayat Pinjaman"
      subtitle="Daftar pinjaman yang sudah lunas"
    >
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIK, No. HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Card */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Pinjaman Lunas</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(filteredLoans.reduce((sum, l) => sum + l.totalAmount, 0))}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Jumlah Pinjaman</p>
          <p className="text-2xl font-bold text-primary">{filteredLoans.length}</p>
        </div>
      </div>

      {/* Loans Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Belum ada riwayat pinjaman lunas</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Tanggal Lunas</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan, index) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{loan.memberName}</p>
                      {loan.memberPhone && (
                        <p className="text-xs text-muted-foreground">{loan.memberPhone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{CATEGORY_LABELS[loan.category]}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(loan.totalAmount)}
                  </TableCell>
                  <TableCell>{formatDate(loan.dueDate)}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">Lunas</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedLoan(loan)}
                        title="Lihat Struk"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handlePrintLoan(loan)}
                        title="Cetak"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRestore(loan.id)}
                        title="Kembalikan ke Aktif"
                      >
                        <RotateCcw className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setLoanToDelete(loan.id)}
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!loanToDelete} onOpenChange={() => setLoanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Riwayat Pinjaman?</AlertDialogTitle>
            <AlertDialogDescription>
              Data pinjaman ini akan dihapus secara permanen dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipt Modal */}
      <ReceiptModal
        loan={selectedLoan}
        open={!!selectedLoan}
        onClose={() => setSelectedLoan(null)}
        borrowerPhone={selectedLoan?.memberPhone}
      />

      {/* Hidden Print Component */}
      {loanToPrint && (
        <div className="hidden">
          <LoanReceipt ref={printRef} loan={loanToPrint} />
        </div>
      )}
    </MainLayout>
  );
}
