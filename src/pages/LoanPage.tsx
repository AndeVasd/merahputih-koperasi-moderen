import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoanTable } from '@/components/loans/LoanTable';
import { LoanForm } from '@/components/loans/LoanForm';
import { ReceiptModal } from '@/components/receipt/ReceiptModal';
import { LoanReceipt } from '@/components/receipt/LoanReceipt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download, Loader2 } from 'lucide-react';
import { useLoans, LoanInput } from '@/hooks/useLoans';
import { Loan, LoanCategory, CATEGORY_LABELS } from '@/types/koperasi';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';

const categoryMap: Record<string, LoanCategory> = {
  uang: 'uang',
  sembako: 'sembako',
  'alat-pertanian': 'alat_pertanian',
  obat: 'obat',
};

export default function LoanPage() {
  const { category: urlCategory } = useParams<{ category: string }>();
  const category = categoryMap[urlCategory || 'uang'] || 'uang';
  
  // Use the frontend category directly as database category (they're the same)
  const dbCategory = category;
  
  const { loans, loading, addLoan, updateLoanStatus, deleteLoan } = useLoans(dbCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
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

  // Enhanced search: by name, NIK, phone, and category
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

  const handleAddLoan = async (data: LoanInput) => {
    setIsSubmitting(true);
    try {
      await addLoan({
        ...data,
        category: dbCategory,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintLoan = (loan: Loan) => {
    setLoanToPrint(loan);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const handleExport = () => {
    const csv = [
      ['No', 'ID', 'Anggota', 'Total', 'Bunga', 'Jatuh Tempo', 'Status'],
      ...filteredLoans.map((l, i) => [
        i + 1,
        l.id,
        l.memberName,
        l.totalAmount,
        `${l.interestRate}%`,
        l.dueDate,
        l.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinjaman-${category}.csv`;
    a.click();
    toast.success('Data berhasil diekspor');
  };

  return (
    <MainLayout
      title={CATEGORY_LABELS[category]}
      subtitle={`Kelola ${CATEGORY_LABELS[category].toLowerCase()}`}
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
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button className="gradient-primary" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pinjaman
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Pinjaman</p>
          <p className="text-2xl font-bold text-foreground">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(filteredLoans.reduce((sum, l) => sum + l.totalAmount, 0))}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pinjaman Aktif</p>
          <p className="text-2xl font-bold text-primary">
            {filteredLoans.filter((l) => l.status === 'active').length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Jatuh Tempo</p>
          <p className="text-2xl font-bold text-destructive">
            {filteredLoans.filter((l) => l.status === 'overdue').length}
          </p>
        </div>
      </div>

      {/* Loans Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <LoanTable
          loans={filteredLoans}
          onViewReceipt={(loan) => setSelectedLoan(loan)}
          onPrint={handlePrintLoan}
          onUpdateStatus={updateLoanStatus}
          onDelete={deleteLoan}
        />
      )}

      {/* Loan Form */}
      <LoanForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        category={category}
        onSubmit={handleAddLoan}
        isSubmitting={isSubmitting}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        loan={selectedLoan}
        open={!!selectedLoan}
        onClose={() => setSelectedLoan(null)}
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
