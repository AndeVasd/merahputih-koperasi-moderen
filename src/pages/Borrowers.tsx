import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBorrowers, Borrower } from '@/hooks/useBorrowers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Download, UserCircle, Wallet, Calendar, Phone, MapPin, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Borrowers() {
  const { borrowers, loading } = useBorrowers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);

  const filteredBorrowers = borrowers.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.nik && b.nik.includes(searchQuery)) ||
      (b.phone && b.phone.includes(searchQuery))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleExport = () => {
    const headers = ['Nama', 'NIK', 'Telepon', 'Alamat', 'Total Pinjaman', 'Pinjaman Aktif', 'Total Nilai'];
    const rows = borrowers.map((b) => [
      b.name,
      b.nik || '-',
      b.phone || '-',
      b.address || '-',
      b.totalLoans.toString(),
      b.activeLoans.toString(),
      b.totalAmount.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `data-peminjam-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <MainLayout title="Data Peminjam" subtitle="Kelola data peminjam non-anggota">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIK, atau telepon..."
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Peminjam</p>
              <p className="text-2xl font-bold">{borrowers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Wallet className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pinjaman Aktif</p>
              <p className="text-2xl font-bold">
                {borrowers.reduce((sum, b) => sum + b.activeLoans, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CreditCard className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Nilai Pinjaman</p>
              <p className="text-2xl font-bold">
                {formatCurrency(borrowers.reduce((sum, b) => sum + b.totalAmount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredBorrowers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <UserCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada data peminjam</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="font-semibold">Peminjam</TableHead>
                <TableHead className="font-semibold">NIK</TableHead>
                <TableHead className="font-semibold">Telepon</TableHead>
                <TableHead className="font-semibold">Total Pinjaman</TableHead>
                <TableHead className="font-semibold">Pinjaman Aktif</TableHead>
                <TableHead className="font-semibold">Total Nilai</TableHead>
                <TableHead className="font-semibold">Pinjaman Terakhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBorrowers.map((borrower, index) => (
                <TableRow
                  key={borrower.id}
                  className="hover:bg-secondary/30 transition-colors cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedBorrower(borrower)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                        <UserCircle className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{borrower.name}</p>
                        {borrower.address && (
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {borrower.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{borrower.nik || '-'}</TableCell>
                  <TableCell className="text-sm">{borrower.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{borrower.totalLoans}</Badge>
                  </TableCell>
                  <TableCell>
                    {borrower.activeLoans > 0 ? (
                      <Badge variant="default" className="bg-orange-500">
                        {borrower.activeLoans}
                      </Badge>
                    ) : (
                      <Badge variant="outline">0</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(borrower.totalAmount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(borrower.lastLoanDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedBorrower} onOpenChange={() => setSelectedBorrower(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Peminjam</DialogTitle>
          </DialogHeader>
          {selectedBorrower && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
                  <UserCircle className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedBorrower.name}</h3>
                  {selectedBorrower.nik && (
                    <p className="text-sm text-muted-foreground font-mono">
                      NIK: {selectedBorrower.nik}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {selectedBorrower.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedBorrower.phone}</span>
                  </div>
                )}
                {selectedBorrower.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{selectedBorrower.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold">{selectedBorrower.totalLoans}</p>
                  <p className="text-xs text-muted-foreground">Total Pinjaman</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-2xl font-bold">{selectedBorrower.activeLoans}</p>
                  <p className="text-xs text-muted-foreground">Pinjaman Aktif</p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Nilai Pinjaman</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(selectedBorrower.totalAmount)}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Pinjaman terakhir: {formatDate(selectedBorrower.lastLoanDate)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
