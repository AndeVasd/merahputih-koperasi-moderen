export type LoanCategory = 'uang' | 'sembako' | 'alat_pertanian' | 'obat' | 'barang' | 'elektronik' | 'kendaraan';

export interface Member {
  id: string;
  name: string;
  nik: string;
  address: string;
  phone: string;
  joinDate: string;
}

export interface LoanItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export interface Loan {
  id: string;
  memberId: string;
  memberName: string;
  category: LoanCategory;
  items: LoanItem[];
  totalAmount: number;
  interestRate: number;
  dueDate: string;
  createdAt: string;
  status: 'active' | 'paid' | 'overdue';
  notes?: string;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  paidAt: string;
  method: string;
}

export const CATEGORY_LABELS: Record<LoanCategory, string> = {
  uang: 'Pinjaman Uang',
  sembako: 'Sembako',
  alat_pertanian: 'Alat Pertanian',
  obat: 'Obat-obatan',
  barang: 'Barang',
  elektronik: 'Elektronik',
  kendaraan: 'Kendaraan',
};

export const CATEGORY_ICONS: Record<LoanCategory, string> = {
  uang: '💰',
  sembako: '🍚',
  alat_pertanian: '🌾',
  obat: '💊',
  barang: '📦',
  elektronik: '📱',
  kendaraan: '🚗',
};
