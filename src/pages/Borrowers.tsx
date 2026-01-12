import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBorrowers, BorrowerLoan } from '@/hooks/useBorrowers';
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
import { Search, Download, UserCircle, Wallet, Calendar, Phone, MapPin, CreditCard, Package, Leaf, Pill, Banknote, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const getCategoryInfo = (category: string) => {
  switch (category) {
    case 'uang':
      return { label: 'Pinjaman Uang', icon: Banknote, color: 'bg-green-500/10 text-green-600' };
    case 'sembako':
      return { label: 'Sembako', icon: Package, color: 'bg-orange-500/10 text-orange-600' };
    case 'alat-pertanian':
      return { label: 'Alat Pertanian', icon: Leaf, color: 'bg-emerald-500/10 text-emerald-600' };
    case 'obat-obatan':
      return { label: 'Obat-obatan', icon: Pill, color: 'bg-red-500/10 text-red-600' };
    default:
      return { label: category, icon: Wallet, color: 'bg-gray-500/10 text-gray-600' };
  }
};

export default function Borrowers() {
  const { borrowerLoans, stats, loading } = useBorrowers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<BorrowerLoan | null>(null);

  const filteredLoans = borrowerLoans.filter(
    (loan) =>
      loan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loan.nik && loan.nik.includes(searchQuery)) ||
      (loan.phone && loan.phone.includes(searchQuery)) ||
      loan.category.toLowerCase().includes(searchQuery.toLowerCase())
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
    const headers = ['Nama', 'NIK', 'Telepon', 'Alamat', 'Kategori', 'Total Nilai', 'Status', 'Tanggal Pinjaman'];
    const rows = borrowerLoans.map((loan) => [
      loan.name,
      loan.nik || '-',
      loan.phone || '-',
      loan.address || '-',
      getCategoryInfo(loan.category).label,
      loan.totalAmount.toString(),
      loan.status,
      loan.createdAt,
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
            placeholder="Cari nama, NIK, telepon, atau kategori..."
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
              <p className="text-2xl font-bold">{stats.totalBorrowers}</p>
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
              <p className="text-2xl font-bold">{stats.activeLoans}</p>
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
              <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredLoans.length === 0 ? (
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
                <TableHead className="font-semibold">Kategori</TableHead>
                <TableHead className="font-semibold">Total Nilai</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Tanggal Pinjaman</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan, index) => {
                const categoryInfo = getCategoryInfo(loan.category);
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <TableRow
                    key={loan.id}
                    className="hover:bg-secondary/30 transition-colors cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedLoan(loan)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                          <UserCircle className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{loan.name}</p>
                          {loan.address && (
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {loan.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{loan.nik || '-'}</TableCell>
                    <TableCell className="text-sm">{loan.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={categoryInfo.color}>
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {categoryInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(loan.totalAmount)}
                    </TableCell>
                    <TableCell>
                      {loan.status === 'active' ? (
                        <Badge variant="default" className="bg-orange-500">
                          Aktif
                        </Badge>
                      ) : loan.status === 'paid' ? (
                        <Badge variant="default" className="bg-green-500">
                          Lunas
                        </Badge>
                      ) : (
                        <Badge variant="outline">{loan.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(loan.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pinjaman</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-4">
              {/* Borrower Info */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
                  <UserCircle className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedLoan.name}</h3>
                  {selectedLoan.nik && (
                    <p className="text-sm text-muted-foreground font-mono">
                      NIK: {selectedLoan.nik}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                {selectedLoan.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedLoan.phone}</span>
                  </div>
                )}
                {selectedLoan.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{selectedLoan.address}</span>
                  </div>
                )}
              </div>

              {/* Loan Category */}
              <div className="pt-4 border-t">
                {(() => {
                  const categoryInfo = getCategoryInfo(selectedLoan.category);
                  const CategoryIcon = categoryInfo.icon;
                  return (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Kategori:</span>
                      <Badge variant="secondary" className={categoryInfo.color}>
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {categoryInfo.label}
                      </Badge>
                    </div>
                  );
                })()}
              </div>

              {/* Loan Amount & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Nilai Pinjaman</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(selectedLoan.totalAmount)}
                  </p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  {selectedLoan.status === 'active' ? (
                    <Badge variant="default" className="bg-orange-500 text-lg px-3 py-1">
                      Aktif
                    </Badge>
                  ) : selectedLoan.status === 'paid' ? (
                    <Badge variant="default" className="bg-green-500 text-lg px-3 py-1">
                      Lunas
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {selectedLoan.status}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Tanggal Pinjaman: {formatDate(selectedLoan.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Jatuh Tempo: {formatDate(selectedLoan.dueDate)}</span>
                </div>
              </div>

              {/* KTP Image */}
              {selectedLoan.ktpImageUrl && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Foto KTP</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={selectedLoan.ktpImageUrl}
                      alt="Foto KTP"
                      className="w-full h-auto object-contain max-h-[300px]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="flex items-center justify-center h-32 text-muted-foreground">
                            <span>Gagal memuat gambar</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </div>
              )}

              {!selectedLoan.ktpImageUrl && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Image className="h-4 w-4" />
                    <span className="text-sm">Tidak ada foto KTP</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
