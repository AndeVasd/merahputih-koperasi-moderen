import { LoanCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/koperasi';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CategoryCardProps {
  category: LoanCategory;
  amount: number;
  count: number;
}

const categoryPaths: Record<LoanCategory, string> = {
  uang: '/pinjaman/uang',
  sembako: '/pinjaman/sembako',
  alat_pertanian: '/pinjaman/alat-pertanian',
  obat: '/pinjaman/obat',
};

export function CategoryCard({ category, amount, count }: CategoryCardProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      onClick={() => navigate(categoryPaths[category])}
      className={cn(
        'group cursor-pointer rounded-xl border border-border bg-card p-4 lg:p-6',
        'transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1',
        'animate-fade-in'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 lg:h-14 lg:w-14 items-center justify-center rounded-xl bg-primary/10 text-2xl lg:text-3xl transition-all group-hover:bg-primary group-hover:scale-110 flex-shrink-0">
          <span className="group-hover:scale-110 transition-transform">
            {CATEGORY_ICONS[category]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm lg:text-base text-foreground group-hover:text-primary transition-colors truncate">
            {CATEGORY_LABELS[category]}
          </h3>
          <p className="text-xs text-muted-foreground">{count} pinjaman aktif</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">Total Pinjaman</p>
        <p className="text-sm lg:text-xl font-bold text-foreground truncate">{formatCurrency(amount)}</p>
      </div>
    </div>
  );
}
