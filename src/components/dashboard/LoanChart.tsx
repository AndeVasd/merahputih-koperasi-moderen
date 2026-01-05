import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { DbLoan } from '@/hooks/useLoans';

interface LoanChartProps {
  loans: DbLoan[];
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const CATEGORY_LABELS: Record<string, string> = {
  uang: 'Uang',
  sembako: 'Sembako',
  alat_pertanian: 'Alat Pertanian',
  obat: 'Obat',
};

export function LoanChart({ loans }: LoanChartProps) {
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const data: Record<string, { month: string; total: number; count: number; uang: number; sembako: number; alat_pertanian: number; obat: number }> = {};

    // Initialize all months
    MONTHS.forEach((month, index) => {
      data[index] = {
        month,
        total: 0,
        count: 0,
        uang: 0,
        sembako: 0,
        alat_pertanian: 0,
        obat: 0,
      };
    });

    // Aggregate loan data by month
    loans.forEach((loan) => {
      const loanDate = new Date(loan.created_at);
      if (loanDate.getFullYear() === currentYear) {
        const monthIndex = loanDate.getMonth();
        data[monthIndex].total += loan.total_amount;
        data[monthIndex].count += 1;
        
        // Add to category
        const category = loan.category as keyof typeof CATEGORY_LABELS;
        if (category in data[monthIndex]) {
          (data[monthIndex] as any)[category] += loan.total_amount;
        }
      }
    });

    return Object.values(data);
  }, [loans]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}jt`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}rb`;
    }
    return value.toString();
  };

  const formatTooltipCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Total Pinjaman per Bulan - Area Chart */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Total Pinjaman per Bulan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  className="text-xs fill-muted-foreground"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [formatTooltipCurrency(value), 'Total']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pinjaman per Kategori - Bar Chart */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Pinjaman per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => [
                    formatTooltipCurrency(value),
                    CATEGORY_LABELS[name] || name
                  ]}
                />
                <Legend 
                  formatter={(value) => CATEGORY_LABELS[value] || value}
                />
                <Bar dataKey="uang" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="sembako" stackId="a" fill="hsl(var(--accent))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="alat_pertanian" stackId="a" fill="hsl(142 76% 36%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="obat" stackId="a" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
