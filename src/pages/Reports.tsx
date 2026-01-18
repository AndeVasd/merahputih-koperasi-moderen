import { useState, useRef, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Printer } from 'lucide-react';
import { CATEGORY_LABELS, LoanCategory } from '@/types/koperasi';
import { useReactToPrint } from 'react-to-print';
import { useLoans } from '@/hooks/useLoans';
import { useKoperasiSettings } from '@/hooks/useKoperasiSettings';
import { Skeleton } from '@/components/ui/skeleton';
import logoKopdes from '@/assets/logo-kopdes.png';

export default function Reports() {
  const [reportType, setReportType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  const { loans, loading } = useLoans();
  const { settings } = useKoperasiSettings();

  const kopiName = settings?.name || 'Koperasi Desa Merah Putih';
  const kopiAddress = settings?.address || 'Desa Mesuji Jaya';

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Laporan-${kopiName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      if (reportType !== 'all' && loan.category !== reportType) return false;
      const loanDate = loan.created_at.split('T')[0];
      if (dateFrom && loanDate < dateFrom) return false;
      if (dateTo && loanDate > dateTo) return false;
      return true;
    });
  }, [loans, reportType, dateFrom, dateTo]);

  const totalAmount = filteredLoans.reduce((sum, l) => sum + l.total_amount, 0);
  const activeLoans = filteredLoans.filter((l) => l.status === 'active');
  const paidLoans = filteredLoans.filter((l) => l.status === 'paid');
  const overdueLoans = filteredLoans.filter((l) => l.status === 'overdue');

  const handleExportCSV = () => {
    const csv = [
      [`Laporan ${kopiName}`],
      ['Periode:', dateFrom || 'Awal', '-', dateTo || 'Sekarang'],
      [''],
      ['No', 'ID', 'Anggota', 'Kategori', 'Total', 'Status', 'Tanggal'],
      ...filteredLoans.map((l, i) => [
        i + 1,
        l.id,
        l.members?.name || l.borrower_name || 'Unknown',
        CATEGORY_LABELS[l.category as LoanCategory] || l.category,
        l.total_amount,
        l.status,
        l.created_at.split('T')[0],
      ]),
      [''],
      ['Total Pinjaman:', totalAmount],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${kopiName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <MainLayout title="Laporan" subtitle="Laporan dan statistik koperasi">
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Laporan" subtitle="Laporan dan statistik koperasi">
      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Filter Laporan</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dari Tanggal</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Sampai Tanggal</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button className="gradient-primary" onClick={() => handlePrint()}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="rounded-xl border border-border bg-card p-8">
        {/* Header */}
        <div className="text-center mb-8 print:mb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logoKopdes} alt="Logo Koperasi" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{kopiName.toUpperCase()}</h1>
          <p className="text-muted-foreground">{kopiAddress}</p>
          <div className="mt-4 py-2 border-y border-border">
            <h2 className="text-lg font-semibold">LAPORAN PINJAMAN</h2>
            <p className="text-sm text-muted-foreground">
              Periode: {dateFrom || 'Awal'} - {dateTo || new Date().toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        {/* Summary Stats - Hidden when printing */}
        <div className="grid gap-4 md:grid-cols-4 mb-8 print:hidden">
          <div className="p-4 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground">Total Pinjaman</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10">
            <p className="text-sm text-muted-foreground">Pinjaman Aktif</p>
            <p className="text-xl font-bold text-primary">{activeLoans.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-success/10">
            <p className="text-sm text-muted-foreground">Lunas</p>
            <p className="text-xl font-bold text-success">{paidLoans.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10">
            <p className="text-sm text-muted-foreground">Jatuh Tempo</p>
            <p className="text-xl font-bold text-destructive">{overdueLoans.length}</p>
          </div>
        </div>

        {/* Loan Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 px-2">No</th>
                <th className="text-left py-3 px-2">ID</th>
                <th className="text-left py-3 px-2">Anggota</th>
                <th className="text-left py-3 px-2">Kategori</th>
                <th className="text-right py-3 px-2">Jumlah</th>
                <th className="text-center py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan, index) => (
                <tr key={loan.id} className="border-b border-border/50">
                  <td className="py-2 px-2">{index + 1}</td>
                  <td className="py-2 px-2 font-mono text-xs">{loan.id.slice(0, 8)}</td>
                  <td className="py-2 px-2">{loan.members?.name || loan.borrower_name || 'Unknown'}</td>
                  <td className="py-2 px-2">{CATEGORY_LABELS[loan.category as LoanCategory] || loan.category}</td>
                  <td className="py-2 px-2 text-right font-medium">
                    {formatCurrency(loan.total_amount)}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        loan.status === 'active'
                          ? 'bg-primary/10 text-primary'
                          : loan.status === 'paid'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {loan.status === 'active' ? 'Aktif' : loan.status === 'paid' ? 'Lunas' : 'Jatuh Tempo'}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    {new Date(loan.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-bold">
                <td colSpan={4} className="py-3 px-2">
                  TOTAL
                </td>
                <td className="py-3 px-2 text-right text-primary">
                  {formatCurrency(totalAmount)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground print:mt-4">
          <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          <p className="mt-1">{kopiName} © {new Date().getFullYear()}</p>
        </div>
      </div>
    </MainLayout>
  );
}
