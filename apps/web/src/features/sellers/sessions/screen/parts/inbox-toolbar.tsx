import { type SessionStatus } from '@shirtify/core';
import { AppButton } from '@shirtify/ui';
import { Repeat } from '@shirtify/ui/flow';

type Filter = SessionStatus | 'all';

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'archived', label: 'Archived' },
];

export function InboxToolbar({
  active,
  onChange,
}: {
  active: Filter;
  onChange: (filter: Filter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Repeat each={FILTERS}>
        {(filter) => (
          <AppButton
            key={filter.id}
            variant={active === filter.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onChange(filter.id)}
          >
            {filter.label}
          </AppButton>
        )}
      </Repeat>
    </div>
  );
}

export type { Filter };
