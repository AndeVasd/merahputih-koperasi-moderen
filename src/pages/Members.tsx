import { MainLayout } from '@/components/layout/MainLayout';
import { OrganizationSection } from '@/components/members/OrganizationSection';

// Data struktur pengurus koperasi
const pengurusMembers = [
  { id: '1', name: 'Adi Wardana', position: 'Ketua' },
  { id: '2', name: 'Fayzal Kurnia Jaya', position: 'Wakil Ketua Bidang Usaha' },
  { id: '3', name: 'Alfiyana', position: 'Wakil Ketua Bidang Anggota' },
  { id: '4', name: 'Ahmad Sodik', position: 'Sekretaris' },
  { id: '5', name: 'Santi Okta Fitri', position: 'Bendahara' },
];

const pengawasMembers = [
  { id: '6', name: 'Abdullah', position: 'Ketua' },
  { id: '7', name: 'Riston Ari Tonang', position: 'Anggota' },
  { id: '8', name: 'Hamdani', position: 'Anggota' },
];

export default function Members() {
  return (
    <MainLayout title="Struktur Organisasi" subtitle="Pengurus Koperasi Desa Merah Putih">
      <div className="py-8">
        <OrganizationSection
          title="Struktur Pengurus Koperasi Desa Merah Putih Mesuji Jaya"
          members={pengurusMembers}
          layout="pyramid"
        />

        <OrganizationSection
          title="Struktur Pengawas Koperasi Desa Merah Putih Mesuji Jaya"
          members={pengawasMembers}
          layout="row"
        />
      </div>
    </MainLayout>
  );
}
