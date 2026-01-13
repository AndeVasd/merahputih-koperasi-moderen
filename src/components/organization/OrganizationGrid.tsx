import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MemberCard } from './MemberCard';
import { MemberFormDialog } from './MemberFormDialog';
import { OrganizationMember, OrganizationMemberInput } from '@/hooks/useOrganizationMembers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OrganizationGridProps {
  title: string;
  members: OrganizationMember[];
  memberType: 'pengurus' | 'pengawas';
  onAdd: (member: OrganizationMemberInput, photoFile?: File) => Promise<any>;
  onUpdate: (id: string, member: Partial<OrganizationMemberInput>, photoFile?: File) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

export function OrganizationGrid({
  title,
  members,
  memberType,
  onAdd,
  onUpdate,
  onDelete,
}: OrganizationGridProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<OrganizationMember | null>(null);

  const handleEdit = (member: OrganizationMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: { name: string; position: string }, photoFile?: File) => {
    if (editingMember) {
      await onUpdate(editingMember.id, data, photoFile);
    } else {
      await onAdd({ ...data, member_type: memberType }, photoFile);
    }
  };

  const handleDeleteClick = (member: OrganizationMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (memberToDelete) {
      await onDelete(memberToDelete.id);
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  return (
    <>
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
              {title}
            </CardTitle>
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah {memberType === 'pengurus' ? 'Pengurus' : 'Pengawas'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Belum ada data {memberType}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {members.map((member) => (
                <div key={member.id} className="relative group">
                  <MemberCard member={member} onEdit={handleEdit} />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteClick(member)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MemberFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        member={editingMember}
        memberType={memberType}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Anggota</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{memberToDelete?.name}</strong> dari daftar {memberType}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
