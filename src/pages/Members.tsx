import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MemberTable } from '@/components/members/MemberTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Download, Upload, Search } from 'lucide-react';
import { mockMembers } from '@/data/mockData';
import { Member } from '@/types/koperasi';
import { toast } from 'sonner';

export default function Members() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nik: '',
    address: '',
    phone: '',
  });

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.nik.includes(searchQuery) ||
      member.phone.includes(searchQuery)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMember) {
      setMembers(members.map(m => 
        m.id === editingMember.id 
          ? { ...m, ...formData }
          : m
      ));
      toast.success('Data anggota berhasil diperbarui');
    } else {
      const newMember: Member = {
        id: (members.length + 1).toString(),
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setMembers([...members, newMember]);
      toast.success('Anggota baru berhasil ditambahkan');
    }
    
    setIsFormOpen(false);
    setEditingMember(null);
    setFormData({ name: '', nik: '', address: '', phone: '' });
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      nik: member.nik,
      address: member.address,
      phone: member.phone,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (member: Member) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${member.name}?`)) {
      setMembers(members.filter(m => m.id !== member.id));
      toast.success('Anggota berhasil dihapus');
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Nama', 'NIK', 'Alamat', 'Telepon', 'Tanggal Bergabung'],
      ...members.map(m => [m.id, m.name, m.nik, m.address, m.phone, m.joinDate])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-anggota.csv';
    a.click();
    toast.success('Data berhasil diekspor');
  };

  return (
    <MainLayout title="Data Anggota" subtitle="Kelola data anggota koperasi">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari anggota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button className="gradient-primary" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Anggota
          </Button>
        </div>
      </div>

      {/* Members Table */}
      <MemberTable
        members={filteredMembers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Member Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label>NIK</Label>
              <Input
                required
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                placeholder="16 digit NIK"
                maxLength={16}
              />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alamat lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label>No. Telepon</Label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="gradient-primary">
                {editingMember ? 'Simpan Perubahan' : 'Tambah Anggota'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
