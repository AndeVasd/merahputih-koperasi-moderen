import { MainLayout } from '@/components/layout/MainLayout';
import { OrganizationGrid } from '@/components/organization/OrganizationGrid';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';
import { Skeleton } from '@/components/ui/skeleton';

export default function Organization() {
  const { pengurus, pengawas, loading, addMember, updateMember, deleteMember } = useOrganizationMembers();

  if (loading) {
    return (
      <MainLayout title="Struktur Organisasi" subtitle="Pengurus Koperasi Desa Merah Putih">
        <div className="space-y-8 py-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Struktur Organisasi" subtitle="Pengurus Koperasi Desa Merah Putih">
      <div className="space-y-8 py-6">
        <OrganizationGrid
          title="Struktur Pengurus Koperasi Desa Merah Putih Mesuji Jaya"
          members={pengurus}
          memberType="pengurus"
          onAdd={addMember}
          onUpdate={updateMember}
          onDelete={deleteMember}
        />

        <OrganizationGrid
          title="Struktur Pengawas Koperasi Desa Merah Putih Mesuji Jaya"
          members={pengawas}
          memberType="pengawas"
          onAdd={addMember}
          onUpdate={updateMember}
          onDelete={deleteMember}
        />
      </div>
    </MainLayout>
  );
}
