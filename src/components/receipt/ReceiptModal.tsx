import { useRef, useState } from 'react';
import { Loan, CATEGORY_LABELS } from '@/types/koperasi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Share2, Loader2, MessageCircle } from 'lucide-react';
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
    
    let message = `🧾 *STRUK PINJAMAN*\n`;
    message += `*KOPDES MERAH PUTIH*\n`;
    message += `Desa Mesuji Jaya\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `📋 *Detail Transaksi*\n`;
    message += `No. Transaksi: ${loan.id.slice(0, 8).toUpperCase()}\n`;
    message += `Tanggal: ${formatDate(loan.createdAt)}\n`;
    message += `Jatuh Tempo: ${formatDate(loan.dueDate)}\n`;
    message += `Kategori: ${CATEGORY_LABELS[loan.category]}\n\n`;
    
    message += `👤 *Data Peminjam*\n`;
    message += `Nama: ${loan.memberName}\n\n`;
    
    message += `📦 *Rincian Pinjaman*\n`;
    loan.items.forEach((item, index) => {
      const subtotal = item.quantity * item.pricePerUnit;
      message += `${index + 1}. ${item.name}\n`;
      message += `   ${item.quantity} ${item.unit} x ${formatCurrency(item.pricePerUnit)} = ${formatCurrency(subtotal)}\n`;
    });
    
    message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Subtotal: ${formatCurrency(loan.totalAmount)}\n`;
    message += `Bunga (${loan.interestRate}%): ${formatCurrency(interest)}\n`;
    message += `*TOTAL: ${formatCurrency(grandTotal)}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `Terima kasih atas kepercayaan Anda.\n`;
    message += `Simpan pesan ini sebagai bukti pinjaman.`;
    
    return message;
  };

  const handleShareWhatsApp = async () => {
    if (!loan || !receiptRef.current) return;
    
    const phoneNumber = borrowerPhone || loan.memberPhone;
    
    if (!phoneNumber) {
      toast.error('Nomor telepon tidak tersedia');
      return;
    }
    
    setIsSharing(true);
    
    try {
      // Generate image from receipt
      const dataUrl = await toPng(receiptRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      
      // Convert to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Format phone number (remove leading 0, add country code if needed)
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('62')) {
        formattedPhone = '62' + formattedPhone;
      }
      
      // Generate WhatsApp message
      const message = generateWhatsAppMessage();
      const encodedMessage = encodeURIComponent(message);
      
      // Check if Web Share API is available with files support
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `struk-${loan.id.slice(0, 8)}.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Struk Pinjaman',
              text: message,
              files: [file],
            });
            toast.success('Struk berhasil dibagikan');
            setIsSharing(false);
            return;
          } catch (shareError) {
            // If share was cancelled or failed, fallback to WhatsApp URL
            console.log('Share API failed, falling back to WhatsApp URL');
          }
        }
      }
      
      // Fallback: Open WhatsApp with text message (image will need to be sent separately)
      // Download image first
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `struk-${loan.id.slice(0, 8)}.png`;
      downloadLink.click();
      
      // Then open WhatsApp with the message
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      
      toast.success('Gambar struk telah diunduh. Kirim gambar tersebut bersama dengan pesan WhatsApp.');
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
