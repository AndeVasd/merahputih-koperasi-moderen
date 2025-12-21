import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoanTable } from '@/components/loans/LoanTable';
import { LoanForm } from '@/components/loans/LoanForm';
import { ReceiptModal } from '@/components/receipt/ReceiptModal';
import { LoanReceipt } from '@/components/receipt/LoanReceipt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { mockLoans } from '@/data/mockData';
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
  
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanToPrint, setLoanToPrint] = useState<Loan | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Struk-${loanToPrint?.id}`,
    onAfterPrint: () => setLoanToPrint(null),
  });

  const filteredLoans = loans.filter(
    (loan) =>
      loan.category === category &&
      (loan.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddLoan = (data: any) => {
    const newLoan: Loan = {
      id: `L${String(loans.length + 1).padStart(3, '0')}`,
      ...data,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setLoans([...loans, newLoan]);
    toast.success('Pinjaman berhasil ditambahkan');
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
            placeholder="Cari pinjaman..."
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
      <LoanTable
        loans={filteredLoans}
        onViewReceipt={(loan) => setSelectedLoan(loan)}
        onPrint={handlePrintLoan}
      />

      {/* Loan Form */}
      <LoanForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        category={category}
        onSubmit={handleAddLoan}
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
