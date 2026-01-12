import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface OrganizationCardProps {
  name: string;
  position: string;
  imageUrl?: string;
}

export function OrganizationCard({ name, position, imageUrl }: OrganizationCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-200 to-sky-300 p-1 shadow-lg">
          <Avatar className="w-full h-full">
            <AvatarImage src={imageUrl} alt={name} className="object-cover" />
            <AvatarFallback className="bg-sky-100 text-sky-700 text-lg font-semibold">
              {initials || <User className="w-8 h-8" />}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <h3 className="mt-3 font-bold text-foreground text-sm uppercase tracking-wide">
        {name}
      </h3>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {position}
      </p>
    </div>
  );
}
