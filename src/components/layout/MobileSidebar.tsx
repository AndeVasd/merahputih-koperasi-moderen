import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle,
  Wallet, 
  ShoppingBasket, 
  Tractor, 
  Pill,
  FileText,
  Settings,
  Building2,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import logoKopdes from '@/assets/logo-kopdes.png';
import { useKoperasiSettings } from '@/hooks/useKoperasiSettings';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Building2, label: 'Profil Koperasi', path: '/profil' },
  { icon: Users, label: 'Pengurus', path: '/pengurus' },
  { icon: UserCircle, label: 'Peminjam', path: '/peminjam' },
  { icon: Wallet, label: 'Pinjaman Uang', path: '/pinjaman/uang' },
  { icon: ShoppingBasket, label: 'Sembako', path: '/pinjaman/sembako' },
  { icon: Tractor, label: 'Alat Pertanian', path: '/pinjaman/alat-pertanian' },
  { icon: Pill, label: 'Obat-obatan', path: '/pinjaman/obat' },
  { icon: History, label: 'Riwayat Pinjaman', path: '/riwayat' },
  { icon: FileText, label: 'Laporan', path: '/laporan' },
];

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const location = useLocation();
  const { settings } = useKoperasiSettings();

  const kopiName = settings?.name || 'Koperasi Desa Merah Putih';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu Navigasi</SheetTitle>
        </SheetHeader>
        
        {/* Logo */}
        <div className="flex h-auto min-h-[5rem] items-center gap-3 border-b border-border px-4 py-3">
          <img 
            src={logoKopdes} 
            alt={`Logo ${kopiName}`}
            className="h-14 w-14 object-contain flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-primary leading-snug line-clamp-2">{kopiName}</span>
            <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2 mt-0.5">
              {settings?.address || 'Koperasi Desa'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 bg-card">
          <NavLink
            to="/pengaturan"
            onClick={() => onOpenChange(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
              location.pathname === '/pengaturan'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Settings className="h-5 w-5" />
            Pengaturan
          </NavLink>
        </div>
      </SheetContent>
    </Sheet>
  );
}
