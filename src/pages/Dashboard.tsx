import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { CategoryCard } from '@/components/dashboard/CategoryCard';
import { RecentLoans } from '@/components/dashboard/RecentLoans';
import { ReceiptModal } from '@/components/receipt/ReceiptModal';
import { Users, Wallet, AlertTriangle, TrendingUp } from 'lucide-react';
import { mockLoans, getDashboardStats } from '@/data/mockData';
import { Loan, LoanCategory } from '@/types/koperasi';

export default function Dashboard() {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const stats = getDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const categories: LoanCategory[] = ['uang', 'sembako', 'alat_pertanian', 'obat'];

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Selamat datang di Sistem Koperasi Desa Merah Putih"
    >
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Anggota"
          value={stats.totalMembers}
          subtitle="Anggota aktif"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Total Pinjaman"
          value={formatCurrency(stats.totalLoanAmount)}
          subtitle={`${stats.totalLoans} transaksi`}
          icon={Wallet}
          variant="default"
        />
        <StatCard
          title="Pinjaman Aktif"
          value={stats.activeLoans}
          subtitle="Masih berjalan"
          icon={TrendingUp}
          variant="accent"
        />
        <StatCard
          title="Jatuh Tempo"
          value={stats.overdueLoans}
          subtitle="Perlu perhatian"
          icon={AlertTriangle}
          variant="default"
        />
      </div>

      {/* Category Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Kategori Pinjaman</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              amount={stats.loansByCategory[category]}
              count={mockLoans.filter((l) => l.category === category && l.status === 'active').length}
            />
          ))}
        </div>
      </div>

      {/* Recent Loans */}
      <RecentLoans
        loans={mockLoans.slice(0, 5)}
        onViewReceipt={(loan) => setSelectedLoan(loan)}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        loan={selectedLoan}
        open={!!selectedLoan}
        onClose={() => setSelectedLoan(null)}
      />
    </MainLayout>
  );
}
