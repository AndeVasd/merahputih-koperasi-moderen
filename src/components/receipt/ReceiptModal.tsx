import { useRef } from 'react';
import { Loan } from '@/types/koperasi';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, X } from 'lucide-react';
import { LoanReceipt } from './LoanReceipt';
import { useReactToPrint } from 'react-to-print';

interface ReceiptModalProps {
  loan: Loan | null;
  open: boolean;
  onClose: () => void;
}

export function ReceiptModal({ loan, open, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Struk-${loan?.id}`,
  });

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center justify-between">
            <span>Struk Pinjaman</span>
            <div className="flex gap-2">
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
