import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Phone, Mail, User, Users, Building2, FileText, Hash, BadgeCheck } from 'lucide-react';
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="h-[500px] lg:col-span-3" />
            <Skeleton className="h-[500px] lg:col-span-9" />
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
        {/* Main Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Koperasi Identity */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-5 flex flex-col items-center text-center">
                {/* Logo */}
                <div className="bg-white rounded-2xl p-3 shadow-lg mb-3">
                  <img 
                    src={logoKopdes} 
                    alt={`Logo ${settings?.name || 'Koperasi'}`} 
                    className="h-24 w-24 object-contain"
                  />
                </div>

                {/* Name */}
                <h2 className="text-base font-bold text-foreground mb-2 leading-tight">
                  {settings?.name || 'Koperasi Desa Merah Putih Mesuji Jaya'}
                </h2>

                {/* Details */}
                <div className="w-full space-y-2 text-left text-sm">
                  <InfoRow icon={<Hash className="h-3.5 w-3.5" />} label="NIK" value="1.602.080.120.002" />
                  <InfoRow icon={<FileText className="h-3.5 w-3.5" />} label="NIB" value="-" />
                  <InfoRow icon={<FileText className="h-3.5 w-3.5" />} label="AHU" value="AHU-0069291.AH.01.29.TAHUN 2025" small />
                </div>

                <Separator className="my-3" />

                <div className="w-full space-y-2 text-left text-sm">
                  <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Telepon" value={settings?.phone || '-'} />
                  <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={settings?.email || '-'} />
                </div>

                <Separator className="my-3" />

                {/* Status Badge */}
                <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <BadgeCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">Berbadan Hukum</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-9 space-y-6">
            {/* Tentang Koperasi */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tentang Koperasi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Koperasi Desa Merah Putih Mesuji Jaya merupakan koperasi simpan pinjam yang melayani 
                  kebutuhan masyarakat desa dalam bidang pinjaman uang, sembako, alat pertanian, dan obat-obatan.
                </p>
              </CardContent>
            </Card>

            {/* Kedudukan + Peta */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Kedudukan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Location Grid */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <LocationBox label="Provinsi" value="SUMATERA SELATAN" />
                      <LocationBox label="Kabupaten/Kota" value="KAB. OGAN KOMERING ILIR" />
                      <LocationBox label="Kecamatan" value="MESUJI MAKMUR" />
                      <LocationBox label="Kelurahan/Desa" value="MESUJI JAYA" />
                    </div>
                    <div className="p-3 rounded-lg border bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Kode Pos</p>
                      <p className="font-bold text-sm text-foreground">30662</p>
                    </div>
                  </div>

                  {/* Right: Map */}
                  <div className="rounded-lg overflow-hidden border min-h-[250px]">
                    <iframe
                      title="Lokasi Koperasi"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63799.55!2d105.05!3d-3.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e3b9c0c0c0c0c0c%3A0x0!2sKecamatan+Mesuji+Makmur!5e0!3m2!1sid!2sid!4v1700000000000"
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: '250px' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alamat Lengkap */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Alamat Lengkap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <p className="text-foreground text-sm">
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
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-52 flex-shrink-0" />)}
              </div>
            ) : pengurus.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">Belum ada data pengurus</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {pengurus.map((m) => (
                  <MemberChip key={m.id} name={m.name} position={m.position} photoUrl={m.photo_url} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

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
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-52 flex-shrink-0" />)}
              </div>
            ) : pengawas.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">Belum ada data pengawas</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {pengawas.map((m) => (
                  <MemberChip key={m.id} name={m.name} position={m.position} photoUrl={m.photo_url} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

function InfoRow({ icon, label, value, small }: { icon: React.ReactNode; label: string; value: string; small?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className={`font-medium text-foreground ${small ? 'text-xs' : 'text-sm'} break-words`}>{value}</p>
      </div>
    </div>
  );
}

function LocationBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border bg-muted/30">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-sm text-foreground">{value}</p>
    </div>
  );
}

function MemberChip({ name, position, photoUrl }: { name: string; position: string; photoUrl: string | null }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
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
