import { useRef, useState } from 'react';
import { Loan, CATEGORY_LABELS } from '@/types/koperasi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Loader2, MessageCircle } from 'lucide-react';
import { LoanReceipt } from './LoanReceipt';
import { useReactToPrint } from 'react-to-print';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

interface ReceiptModalProps {
  loan: Loan | null;
  open: boolean;
  onClose: () => void;
  borrowerPhone?: string;
}

export function ReceiptModal({ loan, open, onClose, borrowerPhone }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Struk-${loan?.id}`,
  });

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

  const generateWhatsAppMessage = () => {
    if (!loan) return '';
    
    const interest = loan.totalAmount * (loan.interestRate / 100);
    const grandTotal = loan.totalAmount + interest;
    
    let message = `*KOPDES MERAH PUTIH*\n`;
    message += `------------------------\n\n`;
    message += `Terima kasih telah melakukan pinjaman di Koperasi Desa Merah Putih.\n\n`;
    
    message += `*Nama:* ${loan.memberName}\n`;
    if (loan.memberNik) message += `*NIK:* ${loan.memberNik}\n`;
    message += `*Nominal Pinjaman:* ${formatCurrency(loan.totalAmount)}\n`;
    message += `*Total Pengembalian:* ${formatCurrency(grandTotal)}\n\n`;
    
    message += `⚠️ *PENTING:* Simpan struk ini dengan baik. Wajib dibawa saat pelunasan.\n\n`;
    message += `_Terima kasih atas kepercayaan Anda._`;
    
    return message;
  };

  const handleShareWhatsApp = async () => {
    if (!loan || !receiptRef.current) return;

    setIsSharing(true);

    try {
      // Generate image from receipt
      const dataUrl = await toPng(receiptRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      const message = generateWhatsAppMessage();
      const fileName = `struk-${loan.id.slice(0, 8)}.png`;

      // Best effort (mobile): Use Web Share API so WhatsApp receives image + caption.
      const navAny = navigator as unknown as {
        share?: (data: { title?: string; text?: string; files?: File[] }) => Promise<void>;
        canShare?: (data: { files?: File[] }) => boolean;
      };

      if (typeof navAny.share === 'function') {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], fileName, { type: blob.type || 'image/png' });

        if (typeof navAny.canShare !== 'function' || navAny.canShare({ files: [file] })) {
          await navAny.share({
            title: 'Struk Pinjaman',
            text: message,
            files: [file],
          });

          toast.success('Pilih WhatsApp lalu kirim ke nomor tujuan (gambar + pesan sudah ikut).');
          return;
        }
      }

      // Fallback (desktop/web): WhatsApp deep link can't attach images automatically.
      const phoneNumber = borrowerPhone || loan.memberPhone;
      if (!phoneNumber) {
        toast.error('Nomor telepon tidak tersedia');
        return;
      }

      // Format phone number (remove leading 0, add country code if needed)
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('62')) {
        formattedPhone = '62' + formattedPhone;
      }

      // Download image first (user can attach manually)
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = fileName;
      downloadLink.click();

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');

      toast.success('Gambar struk diunduh. Lampirkan gambar saat mengirim pesan WhatsApp.');
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Gagal membagikan struk');
    } finally {
      setIsSharing(false);
    }
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center justify-between">
            <span>Struk Pinjaman</span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleShareWhatsApp}
                disabled={isSharing}
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4 mr-2" />
                )}
                WhatsApp
              </Button>
              <Button size="sm" variant="outline" onClick={() => handlePrint()}>
                <Printer className="h-4 w-4 mr-2" />
                Cetak
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <LoanReceipt ref={receiptRef} loan={loan} />
      </DialogContent>
    </Dialog>
  );
}
