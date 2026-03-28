import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Phone, Mail, User, Users, Building2, FileText, Hash } from 'lucide-react';
import logoKopdes from '@/assets/logo-kopdes.png';
import { useKoperasiSettings } from '@/hooks/useKoperasiSettings';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

const Profile = () => {
  const { settings, isLoading } = useKoperasiSettings();
  const { pengurus, pengawas, loading: membersLoading } = useOrganizationMembers();

  if (isLoading) {
    return (
      <MainLayout title="Profil Koperasi" subtitle="Memuat informasi...">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96 lg:col-span-2" />
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
        {/* Top Section: Sidebar + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Koperasi Identity */}
          <Card className="overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center text-center">
              {/* Logo */}
              <div className="bg-white rounded-2xl p-4 shadow-lg mb-4">
                <img 
                  src={logoKopdes} 
                  alt={`Logo ${settings?.name || 'Koperasi'}`} 
                  className="h-28 w-28 object-contain"
                />
              </div>

              {/* Badges */}
              <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-3">
                Koperasi Simpan Pinjam
              </span>

              {/* Name */}
              <h2 className="text-lg font-bold text-foreground mb-3">
                {settings?.name || 'Koperasi Desa Merah Putih'}
              </h2>

              {/* Details */}
              <div className="w-full space-y-2 text-left text-sm">
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs">NIK</p>
                    <p className="font-medium text-foreground">1.602.080.120.002</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs">NIB</p>
                    <p className="font-medium text-foreground">-</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs">AHU</p>
                    <p className="font-medium text-foreground text-xs">AHU-0069291.AH.01.29.TAHUN 2025</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Contact Info */}
              <div className="w-full space-y-3 text-left text-sm">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs">Telepon</p>
                    <p className="font-medium text-foreground">{settings?.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="font-medium text-foreground">{settings?.email || '-'}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-600">Berbadan Hukum</span>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Kedudukan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Kedudukan */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Kedudukan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Provinsi</p>
                    <p className="font-bold text-sm text-foreground">SUMATERA SELATAN</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Kabupaten/Kota</p>
                    <p className="font-bold text-sm text-foreground">KAB. OGAN KOMERING ILIR</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Kecamatan</p>
                    <p className="font-bold text-sm text-foreground">MESUJI MAKMUR</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Kelurahan/Desa</p>
                    <p className="font-bold text-sm text-foreground">MESUJI JAYA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alamat Lengkap */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Alamat Lengkap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <p className="text-foreground">
                    {settings?.address || 'Dusun I Desa Mesuji Jaya Kecamatan Mesuji Makmur Kabupaten Ogan Komering Ilir'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pengurus Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Pengurus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-48" />
                ))}
              </div>
            ) : pengurus.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">Belum ada data pengurus</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {pengurus.map((member) => (
                  <MemberChip key={member.id} name={member.name} position={member.position} photoUrl={member.photo_url} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pengawas Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Pengawas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-48" />
                ))}
              </div>
            ) : pengawas.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">Belum ada data pengawas</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {pengawas.map((member) => (
                  <MemberChip key={member.id} name={member.name} position={member.position} photoUrl={member.photo_url} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

function MemberChip({ name, position, photoUrl }: { name: string; position: string; photoUrl: string | null }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
        <AvatarImage src={photoUrl || undefined} alt={name} className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
          {initials || <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-sm text-foreground leading-tight">{name}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{position}</p>
      </div>
    </div>
  );
}

export default Profile;
