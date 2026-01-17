import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Building2, Bell, Shield, Palette } from 'lucide-react';
import logoKopdes from '@/assets/logo-kopdes.png';

export default function Settings() {
  const [kopiName, setKopiName] = useState('Koperasi Desa Merah Putih');
  const [kopiAddress, setKopiAddress] = useState('Desa Mesuji Jaya');
  const [defaultInterestRate, setDefaultInterestRate] = useState('10');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dueDateReminder, setDueDateReminder] = useState(true);

  const handleSaveGeneral = () => {
    toast.success('Pengaturan umum berhasil disimpan');
  };

  const handleSaveNotifications = () => {
    toast.success('Pengaturan notifikasi berhasil disimpan');
  };

  return (
    <MainLayout title="Pengaturan" subtitle="Kelola pengaturan aplikasi koperasi">
      <div className="space-y-6">
        {/* Profil Koperasi */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Profil Koperasi</CardTitle>
                <CardDescription>Informasi dasar tentang koperasi Anda</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <img src={logoKopdes} alt="Logo Koperasi" className="h-20 w-20 object-contain rounded-lg border" />
              <div>
                <p className="font-medium text-foreground">Logo Koperasi</p>
                <p className="text-sm text-muted-foreground">Logo yang digunakan pada struk dan laporan</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2 pt-4">
              <div className="space-y-2">
                <Label htmlFor="kopiName">Nama Koperasi</Label>
                <Input
                  id="kopiName"
                  value={kopiName}
                  onChange={(e) => setKopiName(e.target.value)}
                  placeholder="Nama koperasi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kopiAddress">Alamat</Label>
                <Input
                  id="kopiAddress"
                  value={kopiAddress}
                  onChange={(e) => setKopiAddress(e.target.value)}
                  placeholder="Alamat koperasi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Suku Bunga Default (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={defaultInterestRate}
                  onChange={(e) => setDefaultInterestRate(e.target.value)}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveGeneral} className="gradient-primary">
                Simpan Perubahan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifikasi */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notifikasi</CardTitle>
                <CardDescription>Atur preferensi notifikasi Anda</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Aktifkan Notifikasi</p>
                <p className="text-sm text-muted-foreground">Terima notifikasi tentang aktivitas koperasi</p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Pengingat Jatuh Tempo</p>
                <p className="text-sm text-muted-foreground">Terima pengingat sebelum pinjaman jatuh tempo</p>
              </div>
              <Switch
                checked={dueDateReminder}
                onCheckedChange={setDueDateReminder}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveNotifications} className="gradient-primary">
                Simpan Perubahan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Keamanan */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Keamanan</CardTitle>
                <CardDescription>Pengaturan keamanan akun Anda</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Ubah Password</p>
                <p className="text-sm text-muted-foreground">Perbarui password akun Anda</p>
              </div>
              <Button variant="outline">Ubah Password</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tampilan */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Tampilan</CardTitle>
                <CardDescription>Sesuaikan tampilan aplikasi</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pengaturan tampilan akan tersedia dalam pembaruan mendatang.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
