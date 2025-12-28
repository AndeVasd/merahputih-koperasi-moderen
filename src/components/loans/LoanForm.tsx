import { useState, useEffect } from 'react';
import { LoanCategory, LoanItem, CATEGORY_LABELS } from '@/types/koperasi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMembers } from '@/hooks/useMembers';

interface LoanFormProps {
  open: boolean;
  onClose: () => void;
  category: LoanCategory;
  onSubmit: (data: {
    member_id: string;
    category: string;
    total_amount: number;
    interest_rate: number;
    due_date: string;
    notes?: string;
    items: { name: string; quantity: number; unit: string; price: number }[];
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function LoanForm({ open, onClose, category, onSubmit, isSubmitting }: LoanFormProps) {
  const { members, loading: loadingMembers } = useMembers();
  const [memberId, setMemberId] = useState('');
  const [items, setItems] = useState<Partial<LoanItem>[]>([
    { name: '', quantity: 1, unit: '', pricePerUnit: 0 },
  ]);
  const [interestRate, setInterestRate] = useState('1');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setMemberId('');
      setItems([{ name: '', quantity: 1, unit: '', pricePerUnit: 0 }]);
      setInterestRate('1');
      setDueDate('');
      setNotes('');
    }
  }, [open]);

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unit: '', pricePerUnit: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LoanItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.pricePerUnit || 0);
    }, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      member_id: memberId,
      category,
      total_amount: calculateTotal(),
      interest_rate: parseFloat(interestRate),
      due_date: dueDate,
      notes: notes || undefined,
      items: items
        .filter((item) => item.name)
        .map((item) => ({
          name: item.name || '',
          quantity: item.quantity || 1,
          unit: item.unit || 'pcs',
          price: item.pricePerUnit || 0,
        })),
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah {CATEGORY_LABELS[category]}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Selection */}
          <div className="space-y-2">
            <Label>Pilih Anggota</Label>
            <Select value={memberId} onValueChange={setMemberId} required>
              <SelectTrigger>
                <SelectValue placeholder={loadingMembers ? 'Memuat...' : 'Pilih anggota...'} />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.nik}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Rincian Pinjaman</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 p-4 rounded-lg bg-secondary/50">
                <div className="col-span-4">
                  <Label className="text-xs">Nama Item</Label>
                  <Input
                    placeholder="Nama item..."
                    value={item.name || ''}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Jumlah</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Satuan</Label>
                  <Input
                    placeholder="kg, pcs..."
                    value={item.unit || ''}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Harga/Satuan</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.pricePerUnit || ''}
                    onChange={(e) => updateItem(index, 'pricePerUnit', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="col-span-1 flex items-end">
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Interest and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bunga (%)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Jatuh Tempo</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Catatan (Opsional)</Label>
            <Textarea
              placeholder="Tambahkan catatan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Total */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Pinjaman:</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="gradient-primary" disabled={isSubmitting || !memberId}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan Pinjaman
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
