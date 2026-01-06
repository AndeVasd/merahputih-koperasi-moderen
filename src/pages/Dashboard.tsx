import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { CategoryCard } from '@/components/dashboard/CategoryCard';
import { RecentLoans } from '@/components/dashboard/RecentLoans';
import { LoanChart } from '@/components/dashboard/LoanChart';
import { ReceiptModal } from '@/components/receipt/ReceiptModal';
import { Users, Wallet, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Loan, LoanCategory } from '@/types/koperasi';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const { stats, loans, loading } = useDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const categories: LoanCategory[] = ['uang', 'sembako', 'alat_pertanian', 'obat', 'barang', 'elektronik', 'kendaraan'];

  // Transform DbLoan to Loan for RecentLoans and ReceiptModal
  const transformedLoans: Loan[] = loans.slice(0, 5).map((loan) => ({
    id: loan.id,
    memberId: loan.member_id,
    memberName: loan.members?.name || 'Unknown',
    category: loan.category as LoanCategory,
    items: (loan.loan_items || []).map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      pricePerUnit: item.price,
    })),
    totalAmount: loan.total_amount,
    interestRate: loan.interest_rate,
    dueDate: loan.due_date,
    status: loan.status,
    notes: loan.notes || undefined,
    createdAt: loan.created_at,
  }));

  if (loading) {
    return (
      <MainLayout
        title="Dashboard"
        subtitle="Selamat datang di Sistem Koperasi Desa Merah Putih"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Skeleton className="h-[380px] rounded-xl" />
          <Skeleton className="h-[380px] rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Selamat datang di Sistem Koperasi Desa Merah Putih"
    >
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard
          title="Total Anggota"
          value={stats.totalMembers}
          subtitle="Anggota terdaftar"
          icon={Users}
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
          title="Lunas"
          value={stats.paidLoans}
          subtitle="Sudah dibayar"
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Jatuh Tempo"
          value={stats.overdueLoans}
          subtitle="Perlu perhatian"
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Charts */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Statistik Pinjaman</h2>
        <LoanChart loans={loans} />
      </div>

      {/* Category Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Kategori Pinjaman</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {categories.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              amount={stats.loansByCategory[category]}
              count={stats.countByCategory[category]}
            />
          ))}
        </div>
      </div>

      {/* Recent Loans */}
      <RecentLoans
        loans={transformedLoans}
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
