import { useState, useEffect, useRef } from 'react';
import { LoanCategory, LoanItem, CATEGORY_LABELS } from '@/types/koperasi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, Upload, X, ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMembers } from '@/hooks/useMembers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoanFormProps {
  open: boolean;
  onClose: () => void;
  category: LoanCategory;
  onSubmit: (data: {
    member_id: string;
    borrower_name?: string;
    borrower_nik?: string;
    borrower_phone?: string;
    borrower_address?: string;
    category: string;
    total_amount: number;
    interest_rate: number;
    due_date: string;
    notes?: string;
    ktp_image_url?: string;
    items: { name: string; quantity: number; unit: string; price: number }[];
  }) => Promise<void>;
  isSubmitting?: boolean;
}

interface OcrResult {
  isValidKtp: boolean;
  errorMessage?: string;
  data?: {
    nik: string;
    nama: string;
    alamat: string;
  };
}

export function LoanForm({ open, onClose, category, onSubmit, isSubmitting }: LoanFormProps) {
  const { members, loading: loadingMembers } = useMembers();
  
  // Borrower selection mode
  const [borrowerMode, setBorrowerMode] = useState<'member' | 'new'>('new');
  const [memberId, setMemberId] = useState('');
  
  // New borrower fields
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerNik, setBorrowerNik] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [borrowerAddress, setBorrowerAddress] = useState('');
  
  // Items for non-money loans
  const [items, setItems] = useState<Partial<LoanItem>[]>([
    { name: '', quantity: 1, unit: '', pricePerUnit: 0 },
  ]);
  
  // Money loan specific
  const [loanAmount, setLoanAmount] = useState('');
  
  const [interestRate, setInterestRate] = useState('1');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // KTP upload
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [uploadingKtp, setUploadingKtp] = useState(false);
  const [processingOcr, setProcessingOcr] = useState(false);
  const [ktpValidated, setKtpValidated] = useState(false);
  const [ktpError, setKtpError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setBorrowerMode('new');
      setMemberId('');
      setBorrowerName('');
      setBorrowerNik('');
      setBorrowerPhone('');
      setBorrowerAddress('');
      setItems([{ name: '', quantity: 1, unit: '', pricePerUnit: 0 }]);
      setLoanAmount('');
      setInterestRate('1');
      setDueDate('');
      setNotes('');
      setKtpFile(null);
      setKtpPreview(null);
      setKtpValidated(false);
      setKtpError(null);
    }
  }, [open]);

  const processKtpOcr = async (imageBase64: string): Promise<OcrResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('ocr-ktp', {
        body: { imageBase64 }
      });
      
      if (error) throw error;
      return data as OcrResult;
    } catch (error) {
      console.error('OCR Error:', error);
      return {
        isValidKtp: false,
        errorMessage: 'Gagal memproses gambar. Silakan coba lagi.'
      };
    }
  };

  const handleKtpSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }
      
      setKtpFile(file);
      setKtpValidated(false);
      setKtpError(null);
      setProcessingOcr(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setKtpPreview(base64);
        
        // Process OCR
        const result = await processKtpOcr(base64);
        setProcessingOcr(false);
        
        if (result.isValidKtp && result.data) {
          setKtpValidated(true);
          setKtpError(null);
          // Auto-fill form fields
          setBorrowerName(result.data.nama || '');
          setBorrowerNik(result.data.nik || '');
          setBorrowerAddress(result.data.alamat || '');
          toast.success('Data KTP berhasil diekstrak!');
        } else {
          setKtpValidated(false);
          setKtpError(result.errorMessage || 'Gambar bukan KTP yang valid');
          setKtpFile(null);
          setKtpPreview(null);
          toast.error(result.errorMessage || 'Gambar bukan KTP yang valid. Silakan upload foto KTP.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeKtpFile = () => {
    setKtpFile(null);
    setKtpPreview(null);
    setKtpValidated(false);
    setKtpError(null);
    // Reset auto-filled fields
    setBorrowerName('');
    setBorrowerNik('');
    setBorrowerAddress('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadKtpImage = async (): Promise<string | null> => {
    if (!ktpFile) return null;
    
    setUploadingKtp(true);
    try {
      const fileExt = ktpFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('ktp-images')
        .upload(fileName, ktpFile);
      
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from('ktp-images')
        .getPublicUrl(data.path);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading KTP:', error);
      return null;
    } finally {
      setUploadingKtp(false);
    }
  };

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
    if (category === 'uang') {
      return parseFloat(loanAmount) || 0;
    }
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

  const isFormValid = () => {
    // Check borrower info
    if (borrowerMode === 'member' && !memberId) return false;
    if (borrowerMode === 'new' && (!borrowerName || !borrowerNik)) return false;
    
    // Check due date
    if (!dueDate) return false;
    
    // Check loan details based on category
    if (category === 'uang') {
      return parseFloat(loanAmount) > 0;
    } else {
      return items.some(item => item.name && (item.quantity || 0) > 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Upload KTP image first if exists
    let ktpImageUrl: string | undefined;
    if (ktpFile) {
      const uploadedUrl = await uploadKtpImage();
      if (uploadedUrl) {
        ktpImageUrl = uploadedUrl;
      }
    }
    
    const submitData: any = {
      category,
      total_amount: calculateTotal(),
      interest_rate: parseFloat(interestRate),
      due_date: dueDate,
      notes: notes || undefined,
      ktp_image_url: ktpImageUrl,
      items: category === 'uang' 
        ? [{ name: 'Pinjaman Uang', quantity: 1, unit: 'Rp', price: parseFloat(loanAmount) || 0 }]
        : items
            .filter((item) => item.name)
            .map((item) => ({
              name: item.name || '',
              quantity: item.quantity || 1,
              unit: item.unit || 'pcs',
              price: item.pricePerUnit || 0,
            })),
    };

    if (borrowerMode === 'member') {
      submitData.member_id = memberId;
    } else {
      submitData.borrower_name = borrowerName;
      submitData.borrower_nik = borrowerNik;
      submitData.borrower_phone = borrowerPhone || undefined;
      submitData.borrower_address = borrowerAddress || undefined;
    }
    
    await onSubmit(submitData);
    onClose();
  };

  const getCategoryPlaceholders = () => {
    switch (category) {
      case 'sembako':
        return { name: 'Contoh: Beras, Minyak Goreng...', unit: 'kg, ltr, pcs' };
      case 'alat_pertanian':
        return { name: 'Contoh: Cangkul, Pupuk, Bibit...', unit: 'pcs, karung, kg' };
      case 'obat':
        return { name: 'Contoh: Pestisida, Herbisida...', unit: 'ltr, botol, pcs' };
      default:
        return { name: 'Nama item...', unit: 'pcs' };
    }
  };

  const placeholders = getCategoryPlaceholders();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah {CATEGORY_LABELS[category]}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Borrower Selection Mode */}
          <div className="space-y-4">
            <Label>Data Peminjam</Label>
            <Tabs value={borrowerMode} onValueChange={(v) => setBorrowerMode(v as 'member' | 'new')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new">Peminjam Baru</TabsTrigger>
                <TabsTrigger value="member">Pilih Anggota</TabsTrigger>
              </TabsList>
              
              <TabsContent value="new" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Lengkap <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="Masukkan nama lengkap..."
                      value={borrowerName}
                      onChange={(e) => setBorrowerName(e.target.value)}
                      required={borrowerMode === 'new'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>NIK <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="Masukkan NIK..."
                      value={borrowerNik}
                      onChange={(e) => setBorrowerNik(e.target.value)}
                      required={borrowerMode === 'new'}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>No. Telepon</Label>
                    <Input
                      placeholder="Masukkan no. telepon..."
                      value={borrowerPhone}
                      onChange={(e) => setBorrowerPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alamat</Label>
                    <Input
                      placeholder="Masukkan alamat..."
                      value={borrowerAddress}
                      onChange={(e) => setBorrowerAddress(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* KTP Upload */}
                <div className="space-y-2">
                  <Label>Foto KTP {ktpValidated && <CheckCircle className="inline h-4 w-4 text-green-500 ml-1" />}</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleKtpSelect}
                    className="hidden"
                    disabled={processingOcr}
                  />
                  {processingOcr ? (
                    <div className="border-2 border-dashed border-primary/50 rounded-lg p-6 text-center bg-primary/5">
                      <Loader2 className="h-8 w-8 mx-auto mb-2 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        Memproses dan memvalidasi KTP...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mengekstrak NIK, Nama, dan Alamat
                      </p>
                    </div>
                  ) : !ktpPreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Klik untuk upload foto KTP
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Data NIK, Nama, dan Alamat akan otomatis terisi
                      </p>
                      {ktpError && (
                        <div className="mt-2 flex items-center justify-center gap-1 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs">{ktpError}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border border-green-500">
                        <img
                          src={ktpPreview}
                          alt="Preview KTP"
                          className="w-full h-48 object-cover"
                        />
                        {ktpValidated && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            KTP Valid
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeKtpFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="member" className="mt-4">
                <div className="space-y-2">
                  <Label>Pilih Anggota</Label>
                  <Select value={memberId} onValueChange={setMemberId}>
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
              </TabsContent>
            </Tabs>
          </div>

          {/* Loan Details - Different based on category */}
          {category === 'uang' ? (
            // Money Loan Form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Jumlah Pinjaman <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Masukkan jumlah pinjaman..."
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            // Items-based Loan Form (Sembako, Alat Pertanian, Obat-obatan)
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Rincian {CATEGORY_LABELS[category]}</Label>
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
                      placeholder={placeholders.name}
                      value={item.name || ''}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Jumlah</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Satuan</Label>
                    <Input
                      placeholder={placeholders.unit}
                      value={item.unit || ''}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Harga/Satuan</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.pricePerUnit || ''}
                      onChange={(e) => updateItem(index, 'pricePerUnit', parseInt(e.target.value) || 0)}
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
          )}

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
              />
            </div>
            <div className="space-y-2">
              <Label>Jatuh Tempo <span className="text-destructive">*</span></Label>
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
            <Button 
              type="submit" 
              className="gradient-primary" 
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan Pinjaman
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
