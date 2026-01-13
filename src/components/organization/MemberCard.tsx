import { User, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrganizationMember } from '@/hooks/useOrganizationMembers';

interface MemberCardProps {
  member: OrganizationMember;
  onEdit: (member: OrganizationMember) => void;
}

export function MemberCard({ member, onEdit }: MemberCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col items-center text-center">
          {/* Photo */}
          <div className="relative mb-4">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center ring-4 ring-primary/20">
              {member.photo_url ? (
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              )}
            </div>
            {/* Edit button overlay */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onEdit(member)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 line-clamp-2">
            {member.name}
          </h3>

          {/* Position */}
          <span className="text-xs sm:text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
            {member.position}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
