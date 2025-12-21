import { forwardRef } from 'react';
import { Loan, CATEGORY_LABELS } from '@/types/koperasi';
import { Separator } from '@/components/ui/separator';

interface LoanReceiptProps {
  loan: Loan;
}

export const LoanReceipt = forwardRef<HTMLDivElement, LoanReceiptProps>(
  ({ loan }, ref) => {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(value);
    };

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    const interest = loan.totalAmount * (loan.interestRate / 100);
    const grandTotal = loan.totalAmount + interest;

    return (
      <div ref={ref} className="bg-card p-8 rounded-xl max-w-md mx-auto print:max-w-full print:p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">K</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-foreground">KOPERASI DESA MERAH PUTIH</h1>
          <p className="text-sm text-muted-foreground">Jl. Raya Desa No. 123, Kec. Maju Jaya</p>
          <p className="text-sm text-muted-foreground">Telp: (021) 1234-5678</p>
        </div>

        <Separator className="my-4" />

        {/* Receipt Info */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-center text-foreground mb-4">
            STRUK PINJAMAN
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="text-muted-foreground">No. Transaksi:</p>
            <p className="font-medium text-foreground text-right">{loan.id}</p>
            <p className="text-muted-foreground">Tanggal:</p>
            <p className="font-medium text-foreground text-right">{formatDate(loan.createdAt)}</p>
            <p className="text-muted-foreground">Jatuh Tempo:</p>
            <p className="font-medium text-foreground text-right">{formatDate(loan.dueDate)}</p>
            <p className="text-muted-foreground">Kategori:</p>
            <p className="font-medium text-foreground text-right">{CATEGORY_LABELS[loan.category]}</p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Member Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-foreground mb-2">Data Peminjam</h3>
          <p className="text-sm text-foreground">{loan.memberName}</p>
          <p className="text-sm text-muted-foreground">ID: {loan.memberId}</p>
        </div>

        <Separator className="my-4" />

        {/* Items */}
        <div className="mb-4">
          <h3 className="font-semibold text-foreground mb-2">Rincian Pinjaman</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground">Item</th>
                <th className="text-center py-2 text-muted-foreground">Qty</th>
                <th className="text-right py-2 text-muted-foreground">Harga</th>
                <th className="text-right py-2 text-muted-foreground">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {loan.items.map((item) => (
                <tr key={item.id} className="border-b border-border/50">
                  <td className="py-2 text-foreground">{item.name}</td>
                  <td className="text-center py-2 text-foreground">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="text-right py-2 text-foreground">
                    {formatCurrency(item.pricePerUnit)}
                  </td>
                  <td className="text-right py-2 text-foreground">
                    {formatCurrency(item.quantity * item.pricePerUnit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Separator className="my-4" />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="text-foreground">{formatCurrency(loan.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bunga ({loan.interestRate}%):</span>
            <span className="text-foreground">{formatCurrency(interest)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span className="text-foreground">TOTAL:</span>
            <span className="text-primary">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-6">
          <p>Terima kasih atas kepercayaan Anda</p>
          <p>Simpan struk ini sebagai bukti pinjaman</p>
          <p className="mt-2">═══════════════════════════════</p>
          <p className="mt-2 font-medium">Dicetak: {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    );
  }
);

LoanReceipt.displayName = 'LoanReceipt';
