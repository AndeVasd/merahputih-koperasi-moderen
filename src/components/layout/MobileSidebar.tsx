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
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import logoKopdes from '@/assets/logo-kopdes.png';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Building2, label: 'Profil Koperasi', path: '/profil' },
  { icon: Users, label: 'Pengurus', path: '/pengurus' },
  { icon: UserCircle, label: 'Peminjam', path: '/peminjam' },
  { icon: Wallet, label: 'Pinjaman Uang', path: '/pinjaman/uang' },
  { icon: ShoppingBasket, label: 'Sembako', path: '/pinjaman/sembako' },
  { icon: Tractor, label: 'Alat Pertanian', path: '/pinjaman/alat-pertanian' },
  { icon: Pill, label: 'Obat-obatan', path: '/pinjaman/obat' },
  { icon: FileText, label: 'Laporan', path: '/laporan' },
];

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const location = useLocation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu Navigasi</SheetTitle>
        </SheetHeader>
        
        {/* Logo */}
        <div className="flex h-20 items-center gap-2 border-b border-border px-4">
          <img 
            src={logoKopdes} 
            alt="Logo Kopdes Merah Putih" 
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
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
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
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
