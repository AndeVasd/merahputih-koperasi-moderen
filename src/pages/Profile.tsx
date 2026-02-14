import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Phone, Mail, Calendar, Target, Eye, Users, Building2 } from 'lucide-react';
import logoKopdes from '@/assets/logo-kopdes.png';
import { useKoperasiSettings } from '@/hooks/useKoperasiSettings';

const Profile = () => {
  const { settings, isLoading } = useKoperasiSettings();

  if (isLoading) {
    return (
      <MainLayout title="Profil Koperasi" subtitle="Memuat informasi...">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="p-8">
              <Skeleton className="h-32 w-32 rounded-2xl" />
              <Skeleton className="h-8 w-64 mt-4" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Profil Koperasi" 
      subtitle={`Informasi lengkap tentang ${settings?.name || 'Koperasi'}`}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="bg-white rounded-2xl p-5 shadow-lg flex-shrink-0">
                <img 
                  src={logoKopdes} 
                  alt={`Logo ${settings?.name || 'Koperasi'}`} 
                  className="h-40 w-40 object-contain"
                />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {settings?.name || 'KOPDES MERAH PUTIH'}
                </h1>
                <p className="text-sm text-muted-foreground mb-4 max-w-md leading-relaxed">
                  {settings?.address || 'Koperasi Desa'}
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Koperasi Simpan Pinjam
                  </span>
                  <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm font-medium">
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informasi Kontak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Informasi Kontak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Alamat</p>
                  <p className="text-muted-foreground">
                    {settings?.address || 'Alamat belum diatur'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Telepon</p>
                  <p className="text-muted-foreground">
                    {settings?.phone || 'Telepon belum diatur'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-muted-foreground">
                    {settings?.email || 'Email belum diatur'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Tanggal Berdiri</p>
                  <p className="text-muted-foreground">17 Agustus 2020</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visi & Misi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Visi & Misi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Visi</h3>
                </div>
                <p className="text-muted-foreground pl-6">
                  Menjadi koperasi desa yang mandiri, transparan, dan berkontribusi nyata 
                  dalam meningkatkan kesejahteraan masyarakat.
                </p>
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Misi</h3>
                </div>
                <ul className="text-muted-foreground pl-6 space-y-2 list-disc list-inside">
                  <li>Memberikan pelayanan simpan pinjam yang mudah dan terjangkau</li>
                  <li>Menyediakan kebutuhan sembako dengan harga bersaing</li>
                  <li>Mendukung petani dengan penyediaan alat pertanian dan obat-obatan</li>
                  <li>Mengelola keuangan secara transparan dan akuntabel</li>
                  <li>Memberdayakan ekonomi masyarakat desa</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Layanan */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Layanan Koperasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h3 className="font-semibold text-blue-600 mb-2">💰 Pinjaman Uang</h3>
                  <p className="text-sm text-muted-foreground">
                    Pinjaman modal usaha dan kebutuhan mendesak dengan bunga ringan
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <h3 className="font-semibold text-orange-600 mb-2">🛒 Sembako</h3>
                  <p className="text-sm text-muted-foreground">
                    Penyediaan kebutuhan pokok dengan sistem pembayaran cicilan
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <h3 className="font-semibold text-green-600 mb-2">🚜 Alat Pertanian</h3>
                  <p className="text-sm text-muted-foreground">
                    Penyewaan dan penjualan alat pertanian untuk mendukung petani
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <h3 className="font-semibold text-purple-600 mb-2">💊 Obat-obatan</h3>
                  <p className="text-sm text-muted-foreground">
                    Penyediaan obat pertanian dan pupuk dengan harga terjangkau
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
