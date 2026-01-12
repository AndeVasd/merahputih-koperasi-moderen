import { OrganizationCard } from './OrganizationCard';

interface Member {
  id: string;
  name: string;
  position: string;
  imageUrl?: string;
}

interface OrganizationSectionProps {
  title: string;
  members: Member[];
  layout?: 'row' | 'pyramid';
}

export function OrganizationSection({ title, members, layout = 'row' }: OrganizationSectionProps) {
  if (layout === 'pyramid' && members.length >= 5) {
    // Pyramid layout: top row (4), bottom row (1 centered)
    const topRow = members.slice(0, 4);
    const bottomRow = members.slice(4);

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold text-destructive text-center mb-8">
          {title}
        </h2>
        <div className="flex flex-col items-center gap-8">
          {/* Top row - 4 members */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {topRow.map((member) => (
              <OrganizationCard
                key={member.id}
                name={member.name}
                position={member.position}
                imageUrl={member.imageUrl}
              />
            ))}
          </div>
          {/* Bottom row - centered */}
          {bottomRow.length > 0 && (
            <div className="flex justify-center gap-8 md:gap-12">
              {bottomRow.map((member) => (
                <OrganizationCard
                  key={member.id}
                  name={member.name}
                  position={member.position}
                  imageUrl={member.imageUrl}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-destructive text-center mb-8">
        {title}
      </h2>
      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
        {members.map((member) => (
          <OrganizationCard
            key={member.id}
            name={member.name}
            position={member.position}
            imageUrl={member.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}
