import { ROUTES, SHIRT_TYPE_LABELS, formatRelative, type Session } from '@shirtify/core';
import { AppTable, AppText, type AppTableColumn } from '@shirtify/ui';
import { useNavigate } from 'react-router-dom';

import { SessionStatusPill } from '../../helpers/session-status.tsx';

const columns: readonly AppTableColumn<Session>[] = [
  {
    key: 'customer',
    header: 'Customer',
    render: (s) => (
      <span>
        <span className="block font-heavy text-sm font-bold text-ink">
          {s.customer_name ?? 'Unnamed'}
        </span>
        <span className="font-mono text-[10px] text-ink-3">/c/{s.token}</span>
      </span>
    ),
  },
  {
    key: 'shirt',
    header: 'Shirt',
    render: (s) => (
      <AppText variant="body-sm" as="span" className="!text-ink">
        {SHIRT_TYPE_LABELS[s.shirt_type]} · {s.shirt_color}
      </AppText>
    ),
  },
  {
    key: 'kind',
    header: 'Source',
    render: (s) => (
      <AppText variant="mono" as="span">
        {s.kind === 'public' ? 'storefront' : 'link'}
      </AppText>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (s) => <SessionStatusPill status={s.status} />,
  },
  {
    key: 'activity',
    header: 'Last activity',
    align: 'right',
    render: (s) => (
      <AppText variant="mono" as="span">
        {formatRelative(s.last_activity_at)}
      </AppText>
    ),
  },
];

export function SessionsTable({ rows }: { rows: readonly Session[] }) {
  const navigate = useNavigate();
  return (
    <AppTable
      columns={columns}
      rows={rows}
      rowKey={(s) => s.id}
      onRowClick={(s) => navigate(ROUTES.SESSION_DETAIL(s.id))}
    />
  );
}
