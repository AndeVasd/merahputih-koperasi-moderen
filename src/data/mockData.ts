import { Member, Loan, LoanCategory } from '@/types/koperasi';

export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    nik: '3201012345678901',
    address: 'Desa Merah Putih RT 01/02',
    phone: '081234567890',
    joinDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Siti Rahayu',
    nik: '3201019876543210',
    address: 'Desa Merah Putih RT 02/03',
    phone: '082345678901',
    joinDate: '2023-02-20',
  },
  {
    id: '3',
    name: 'Ahmad Wijaya',
    nik: '3201015678901234',
    address: 'Desa Merah Putih RT 03/01',
    phone: '083456789012',
    joinDate: '2023-03-10',
  },
  {
    id: '4',
    name: 'Dewi Lestari',
    nik: '3201014321098765',
    address: 'Desa Merah Putih RT 01/04',
    phone: '084567890123',
    joinDate: '2023-04-05',
  },
];

export const mockLoans: Loan[] = [
  {
    id: 'L001',
    memberId: '1',
    memberName: 'Budi Santoso',
    category: 'uang',
    items: [{ id: '1', name: 'Pinjaman Modal Usaha', quantity: 1, unit: 'Rp', pricePerUnit: 5000000 }],
    totalAmount: 5000000,
    interestRate: 1.5,
    dueDate: '2024-06-15',
    createdAt: '2024-01-15',
    status: 'active',
  },
  {
    id: 'L002',
    memberId: '2',
    memberName: 'Siti Rahayu',
    category: 'sembako',
    items: [
      { id: '1', name: 'Beras Premium', quantity: 25, unit: 'kg', pricePerUnit: 14000 },
      { id: '2', name: 'Minyak Goreng', quantity: 5, unit: 'liter', pricePerUnit: 18000 },
      { id: '3', name: 'Gula Pasir', quantity: 5, unit: 'kg', pricePerUnit: 16000 },
    ],
    totalAmount: 520000,
    interestRate: 0.5,
    dueDate: '2024-03-20',
    createdAt: '2024-01-20',
    status: 'paid',
  },
  {
    id: 'L003',
    memberId: '3',
    memberName: 'Ahmad Wijaya',
    category: 'alat_pertanian',
    items: [
      { id: '1', name: 'Cangkul', quantity: 2, unit: 'buah', pricePerUnit: 150000 },
      { id: '2', name: 'Pupuk Urea', quantity: 50, unit: 'kg', pricePerUnit: 12000 },
    ],
    totalAmount: 900000,
    interestRate: 1,
    dueDate: '2024-04-10',
    createdAt: '2024-01-10',
    status: 'active',
  },
  {
    id: 'L004',
    memberId: '4',
    memberName: 'Dewi Lestari',
    category: 'obat',
    items: [
      { id: '1', name: 'Paracetamol', quantity: 10, unit: 'strip', pricePerUnit: 8000 },
      { id: '2', name: 'Vitamin C', quantity: 5, unit: 'botol', pricePerUnit: 25000 },
    ],
    totalAmount: 205000,
    interestRate: 0.5,
    dueDate: '2024-02-05',
    createdAt: '2024-01-05',
    status: 'overdue',
  },
];

export const getDashboardStats = () => {
  const totalMembers = mockMembers.length;
  const totalLoans = mockLoans.length;
  const activeLoans = mockLoans.filter(l => l.status === 'active').length;
  const totalLoanAmount = mockLoans.reduce((sum, l) => sum + l.totalAmount, 0);
  const overdueLoans = mockLoans.filter(l => l.status === 'overdue').length;
  
  const loansByCategory: Record<LoanCategory, number> = {
    uang: 0,
    sembako: 0,
    alat_pertanian: 0,
    obat: 0,
  };
  
  mockLoans.forEach(loan => {
    loansByCategory[loan.category] += loan.totalAmount;
  });

  return {
    totalMembers,
    totalLoans,
    activeLoans,
    totalLoanAmount,
    overdueLoans,
    loansByCategory,
  };
};
