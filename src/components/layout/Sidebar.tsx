import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  ShoppingBasket, 
  Tractor, 
  Pill,
  FileText,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Anggota', path: '/anggota' },
  { icon: Wallet, label: 'Pinjaman Uang', path: '/pinjaman/uang' },
  { icon: ShoppingBasket, label: 'Sembako', path: '/pinjaman/sembako' },
  { icon: Tractor, label: 'Alat Pertanian', path: '/pinjaman/alat-pertanian' },
  { icon: Pill, label: 'Obat-obatan', path: '/pinjaman/obat' },
  { icon: FileText, label: 'Laporan', path: '/laporan' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card no-print">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <span className="text-xl font-bold text-primary-foreground">K</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Koperasi</h1>
            <p className="text-xs text-muted-foreground">Desa Merah Putih</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
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
