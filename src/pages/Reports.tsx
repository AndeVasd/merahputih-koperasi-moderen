import { useState, useRef, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Printer, Wallet, TrendingUp, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { CATEGORY_LABELS, LoanCategory } from '@/types/koperasi';
import { useReactToPrint } from 'react-to-print';
import { useLoans } from '@/hooks/useLoans';
import { useLoanHistory } from '@/hooks/useLoanHistory';
import { useKoperasiSettings } from '@/hooks/useKoperasiSettings';
import { Skeleton } from '@/components/ui/skeleton';
import logoKopdes from '@/assets/logo-kopdes.png';

export default function Reports() {
  const [reportType, setReportType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  const { loans: activeLoansData, loading: loansLoading } = useLoans();
  const { loans: historyLoans, loading: historyLoading } = useLoanHistory();
  const { settings } = useKoperasiSettings();

  const loading = loansLoading || historyLoading;

  // Combine active loans and history (paid) loans
  const allLoans = useMemo(() => {
    const combined = [...activeLoansData];
    // Add paid loans from history that aren't already in active
    historyLoans.forEach((hl) => {
      if (!combined.find((l) => l.id === hl.id)) {
        combined.push(hl);
      }
    });
    return combined;
  }, [activeLoansData, historyLoans]);

  const kopiName = settings?.name || 'Koperasi Desa Merah Putih';
  const kopiAddress = settings?.address || 'Desa Mesuji Jaya';
  const kopiPhone = settings?.phone || '';

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
    return allLoans.filter((loan) => {
      if (reportType !== 'all' && loan.category !== reportType) return false;
      if (statusFilter !== 'all' && loan.status !== statusFilter) return false;
      const loanDate = loan.created_at.split('T')[0];
      if (dateFrom && loanDate < dateFrom) return false;
      if (dateTo && loanDate > dateTo) return false;
      return true;
    });
  }, [allLoans, reportType, statusFilter, dateFrom, dateTo]);

  const totalAmount = filteredLoans.reduce((sum, l) => sum + l.total_amount, 0);
  const activeLoans = filteredLoans.filter((l) => l.status === 'active');
  const paidLoans = filteredLoans.filter((l) => l.status === 'paid');
  const overdueLoans = filteredLoans.filter((l) => l.status === 'overdue');
  const activeAmount = activeLoans.reduce((sum, l) => sum + l.total_amount, 0);
  const paidAmount = paidLoans.reduce((sum, l) => sum + l.total_amount, 0);

  const handleExportCSV = () => {
    const csv = [
      [`Laporan ${kopiName}`],
      ['Periode:', dateFrom || 'Awal', '-', dateTo || 'Sekarang'],
      [''],
      ['No', 'Anggota', 'Kategori', 'Total', 'Bunga (%)', 'Status', 'Tanggal Pinjam', 'Jatuh Tempo'],
      ...filteredLoans.map((l, i) => [
        i + 1,
        l.members?.name || l.borrower_name || '-',
        CATEGORY_LABELS[l.category as LoanCategory] || l.category,
        l.total_amount,
        l.interest_rate,
        l.status === 'active' ? 'Aktif' : l.status === 'paid' ? 'Lunas' : 'Jatuh Tempo',
        l.created_at.split('T')[0],
        l.due_date,
      ]),
      [''],
      ['Total Seluruh Pinjaman:', totalAmount],
      ['Total Pinjaman Aktif:', activeAmount],
      ['Total Pinjaman Lunas:', paidAmount],
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
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Laporan" subtitle="Laporan dan statistik koperasi">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-none bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Total Pinjaman</p>
                <p className="text-lg font-extrabold text-white mt-1">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-white/60 mt-0.5">{filteredLoans.length} transaksi</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-accent to-accent/80 shadow-lg shadow-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Aktif</p>
                <p className="text-lg font-extrabold text-white mt-1">{activeLoans.length}</p>
                <p className="text-xs text-white/60 mt-0.5">{formatCurrency(activeAmount)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-success to-success/80 shadow-lg shadow-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Lunas</p>
                <p className="text-lg font-extrabold text-white mt-1">{paidLoans.length}</p>
                <p className="text-xs text-white/60 mt-0.5">{formatCurrency(paidAmount)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-warning to-warning/80 shadow-lg shadow-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Jatuh Tempo</p>
                <p className="text-lg font-extrabold text-white mt-1">{overdueLoans.length}</p>
                <p className="text-xs text-white/60 mt-0.5">Perlu perhatian</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 lg:p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Filter Laporan
        </h3>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label className="text-xs">Kategori</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Semua" />
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
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="overdue">Jatuh Tempo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Dari Tanggal</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Sampai Tanggal</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="col-span-2 lg:col-span-1 flex items-end gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex-1">
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button size="sm" className="gradient-primary flex-1" onClick={() => handlePrint()}>
              <Printer className="h-4 w-4 mr-1" />
              Cetak
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="rounded-xl border border-border bg-card p-4 lg:p-8">
        {/* Header */}
        <div className="text-center mb-6 print:mb-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={logoKopdes} alt="Logo Koperasi" className="h-14 w-14 object-contain" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">{kopiName.toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">{kopiAddress}</p>
          {kopiPhone && <p className="text-sm text-muted-foreground">Telp: {kopiPhone}</p>}
          <div className="mt-3 py-2 border-y border-border">
            <h2 className="text-base lg:text-lg font-semibold">LAPORAN PINJAMAN</h2>
            <p className="text-xs text-muted-foreground">
              Periode: {dateFrom || 'Awal'} - {dateTo || new Date().toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        {/* Print Summary */}
        <div className="hidden print:grid grid-cols-4 gap-4 mb-6 text-sm">
          <div className="border border-border p-2 rounded text-center">
            <p className="text-muted-foreground">Total</p>
            <p className="font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="border border-border p-2 rounded text-center">
            <p className="text-muted-foreground">Aktif</p>
            <p className="font-bold">{activeLoans.length} ({formatCurrency(activeAmount)})</p>
          </div>
          <div className="border border-border p-2 rounded text-center">
            <p className="text-muted-foreground">Lunas</p>
            <p className="font-bold">{paidLoans.length} ({formatCurrency(paidAmount)})</p>
          </div>
          <div className="border border-border p-2 rounded text-center">
            <p className="text-muted-foreground">Jatuh Tempo</p>
            <p className="font-bold">{overdueLoans.length}</p>
          </div>
        </div>

        {/* Loan Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 px-2 text-xs">No</th>
                <th className="text-left py-2 px-2 text-xs">Anggota</th>
                <th className="text-left py-2 px-2 text-xs hidden sm:table-cell">Kategori</th>
                <th className="text-right py-2 px-2 text-xs">Jumlah</th>
                <th className="text-center py-2 px-2 text-xs">Status</th>
                <th className="text-left py-2 px-2 text-xs hidden md:table-cell">Tanggal</th>
                <th className="text-left py-2 px-2 text-xs hidden lg:table-cell">Jatuh Tempo</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Tidak ada data pinjaman untuk filter yang dipilih
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan, index) => (
                  <tr key={loan.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-2 text-xs">{index + 1}</td>
                    <td className="py-2 px-2">
                      <span className="text-xs font-medium">{loan.members?.name || loan.borrower_name || '-'}</span>
                    </td>
                    <td className="py-2 px-2 text-xs hidden sm:table-cell">
                      {CATEGORY_LABELS[loan.category as LoanCategory] || loan.category}
                    </td>
                    <td className="py-2 px-2 text-right text-xs font-medium">
                      {formatCurrency(loan.total_amount)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
                    <td className="py-2 px-2 text-xs hidden md:table-cell">
                      {new Date(loan.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-2 px-2 text-xs hidden lg:table-cell">
                      {new Date(loan.due_date).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredLoans.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border font-bold">
                  <td colSpan={3} className="py-3 px-2 text-xs">
                    TOTAL ({filteredLoans.length} transaksi)
                  </td>
                  <td className="py-3 px-2 text-right text-xs text-primary">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground print:mt-4">
          <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          <p className="mt-1">{kopiName} © {new Date().getFullYear()}</p>
        </div>
      </div>
    </MainLayout>
  );
}
