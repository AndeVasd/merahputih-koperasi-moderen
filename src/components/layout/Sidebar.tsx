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

export function Sidebar() {
  const location = useLocation();
  const { settings } = useKoperasiSettings();

  const kopiName = settings?.name || 'Koperasi Desa Merah Putih';

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card no-print hidden lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-auto min-h-[5rem] items-center gap-3 border-b border-border px-4 py-3">
          <img 
            src={logoKopdes} 
            alt={`Logo ${kopiName}`}
            className="h-16 w-16 object-contain flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-primary leading-snug line-clamp-2">{kopiName}</span>
            <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2 mt-0.5">
              {settings?.address || 'Koperasi Desa'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
        <div className="border-t border-border p-4">
          <NavLink
            to="/pengaturan"
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
      </div>
    </aside>
  );
}
