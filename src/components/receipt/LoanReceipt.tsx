import { forwardRef } from 'react';
import { Loan, CATEGORY_LABELS } from '@/types/koperasi';
import { Separator } from '@/components/ui/separator';
import logoKopdes from '@/assets/logo-kopdes.png';
import { useKoperasiSettings } from '@/hooks/useKoperasiSettings';

interface LoanReceiptProps {
  loan: Loan;
}

export const LoanReceipt = forwardRef<HTMLDivElement, LoanReceiptProps>(
  ({ loan }, ref) => {
    const { settings } = useKoperasiSettings();

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

    const kopiName = settings?.name || 'KOPDES MERAH PUTIH';
    const kopiAddress = settings?.address || 'Desa Mesuji Jaya';
    const kopiPhone = settings?.phone || '(0721) 123-456';

    return (
      <div ref={ref} className="bg-card p-8 rounded-xl max-w-md mx-auto print:max-w-full print:p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <img 
              src={logoKopdes} 
              alt={`Logo ${kopiName}`}
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-foreground">{kopiName.toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">{kopiAddress}</p>
          {kopiPhone && <p className="text-sm text-muted-foreground">Telp: {kopiPhone}</p>}
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
          <h3 className="font-semibold text-foreground mb-3">Data Peminjam</h3>
          
          {/* KTP Photo */}
          {loan.ktpImageUrl && (
            <div className="mb-3">
              <img 
                src={loan.ktpImageUrl} 
                alt="Foto KTP" 
                className="w-full max-w-xs h-auto rounded-lg border border-border object-cover"
              />
            </div>
          )}
          
          <div className="grid grid-cols-[100px_1fr] gap-y-1 text-sm">
            <span className="text-muted-foreground">Nama:</span>
            <span className="font-medium text-foreground">{loan.memberName}</span>
            
            {loan.memberNik && (
              <>
                <span className="text-muted-foreground">NIK:</span>
                <span className="text-foreground">{loan.memberNik}</span>
              </>
            )}
            
            {loan.memberPhone && (
              <>
                <span className="text-muted-foreground">No. HP:</span>
                <span className="text-foreground">{loan.memberPhone}</span>
              </>
            )}
            
            {loan.memberAddress && (
              <>
                <span className="text-muted-foreground">Alamat:</span>
                <span className="text-foreground">{loan.memberAddress}</span>
              </>
            )}
          </div>
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
