import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CreditCard, Wallet, ExternalLink } from 'lucide-react';
import { usePayments } from '@/hooks/usePayments';
import { Loan } from '@/types/koperasi';

interface PaymentDialogProps {
  loan: Loan | null;
  open: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const statusMap: Record<string, string> = {
  pending: 'Menunggu',
  paid: 'Lunas',
  expired: 'Kadaluarsa',
  failed: 'Gagal',
};

const statusColor: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
  expired: 'bg-muted text-muted-foreground',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function PaymentDialog({ loan, open, onClose }: PaymentDialogProps) {
  const { payments, loading, addManualPayment, createXenditInvoice } = usePayments(loan?.id);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loan) return null;

  const totalWithInterest = loan.totalAmount * (1 + loan.interestRate / 100);
  const totalPaid = payments
    .filter(p => p.payment_status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Math.max(0, totalWithInterest - totalPaid);

  const handleManualPayment = async () => {
    if (!amount || Number(amount) <= 0) return;
    setSubmitting(true);
    try {
      await addManualPayment({ loan_id: loan.id, amount: Number(amount), notes: notes || undefined });
      setAmount('');
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleXenditPayment = async () => {
    if (!amount || Number(amount) <= 0) return;
    setSubmitting(true);
    try {
      const result = await createXenditInvoice({
        loan_id: loan.id,
        amount: Number(amount),
        payer_email: email || undefined,
      });
      if (result?.invoice_url) {
        window.open(result.invoice_url, '_blank');
      }
      setAmount('');
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pembayaran Pinjaman</DialogTitle>
        </DialogHeader>

        {/* Loan Summary */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Peminjam</span>
            <span className="font-medium">{loan.memberName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Pinjaman + Bunga</span>
            <span className="font-medium">{formatCurrency(totalWithInterest)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Dibayar</span>
            <span className="font-medium text-success">{formatCurrency(totalPaid)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
            <span>Sisa</span>
            <span className={remaining > 0 ? 'text-destructive' : 'text-success'}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {remaining > 0 && (
          <Tabs defaultValue="manual" className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="gap-2">
                <Wallet className="h-4 w-4" /> Manual
              </TabsTrigger>
              <TabsTrigger value="xendit" className="gap-2">
                <CreditCard className="h-4 w-4" /> Online (Xendit)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div>
                <Label>Jumlah Bayar</Label>
                <Input
                  type="number"
                  placeholder="Masukkan jumlah"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <button
                  type="button"
                  className="text-xs text-primary mt-1 hover:underline"
                  onClick={() => setAmount(String(remaining))}
                >
                  Bayar sisa: {formatCurrency(remaining)}
                </button>
              </div>
              <div>
                <Label>Catatan (opsional)</Label>
                <Textarea
                  placeholder="Catatan pembayaran..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              <Button onClick={handleManualPayment} disabled={submitting || !amount} className="w-full gradient-primary">
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Catat Pembayaran
              </Button>
            </TabsContent>

            <TabsContent value="xendit" className="space-y-4 mt-4">
              <div>
                <Label>Jumlah Bayar</Label>
                <Input
                  type="number"
                  placeholder="Masukkan jumlah"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <button
                  type="button"
                  className="text-xs text-primary mt-1 hover:underline"
                  onClick={() => setAmount(String(remaining))}
                >
                  Bayar sisa: {formatCurrency(remaining)}
                </button>
              </div>
              <div>
                <Label>Email Pembayar (opsional)</Label>
                <Input
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleXenditPayment} disabled={submitting || !amount} className="w-full gradient-primary">
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Buat Invoice Online
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {/* Payment History */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Riwayat Pembayaran</h4>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada pembayaran</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <div>
                    <p className="font-medium">{formatCurrency(Number(p.amount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.payment_method === 'manual' ? 'Manual' : 'Xendit'}
                      {p.paid_at ? ` • ${formatDate(p.paid_at)}` : ` • ${formatDate(p.created_at)}`}
                    </p>
                    {p.xendit_invoice_url && p.payment_status === 'pending' && (
                      <a href={p.xendit_invoice_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                        Buka link bayar <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <Badge variant="outline" className={statusColor[p.payment_status] || ''}>
                    {statusMap[p.payment_status] || p.payment_status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
