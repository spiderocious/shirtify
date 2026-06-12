import { AppAvatar, AppButton, AppChip, AppPill, AppTable, type AppTableColumn } from '@shirtify/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

interface SessionRow {
  readonly id: string;
  readonly initials: string;
  readonly avatarTone: 'lime' | 'blue' | 'paper';
  readonly name: string;
  readonly link: string;
  readonly shirt: string;
  readonly status: { tone: 'go' | 'ink' | 'warn'; label: string; dot?: boolean };
  readonly quoted: string;
  readonly activity: string;
}

const ROWS: readonly SessionRow[] = [
  {
    id: '1',
    initials: 'TB',
    avatarTone: 'lime',
    name: 'Tobi — birthday hoodie',
    link: '/c/k7m2x9p4',
    shirt: 'Hoodie · Black',
    status: { tone: 'ink', label: 'Submitted' },
    quoted: '₦12,500',
    activity: '2 min ago',
  },
  {
    id: '2',
    initials: 'AM',
    avatarTone: 'blue',
    name: 'Amaka — owambe set',
    link: '/c/p9w3t1k8',
    shirt: 'Tee · Cream',
    status: { tone: 'go', label: 'In progress', dot: true },
    quoted: '₦8,000',
    activity: '14 min ago',
  },
  {
    id: '3',
    initials: 'CH',
    avatarTone: 'paper',
    name: 'Church anniversary — 12 pcs',
    link: '/c/m4x8c2v6',
    shirt: 'Polo · White',
    status: { tone: 'warn', label: 'Quiet 3d', dot: true },
    quoted: '₦45,000',
    activity: '3 days ago',
  },
];

const COLUMNS: readonly AppTableColumn<SessionRow>[] = [
  {
    key: 'customer',
    header: 'Customer',
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <AppAvatar initials={r.initials} tone={r.avatarTone} />
        <div>
          <div className="font-heavy text-sm font-extrabold">{r.name}</div>
          <div className="font-mono text-[10px] text-ink-3">{r.link}</div>
        </div>
      </div>
    ),
  },
  { key: 'shirt', header: 'Shirt', render: (r) => <AppChip>{r.shirt}</AppChip> },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <AppPill tone={r.status.tone} dot={r.status.dot}>
        {r.status.label}
      </AppPill>
    ),
  },
  {
    key: 'quoted',
    header: 'Quoted',
    align: 'right',
    render: (r) => <span className="font-mono font-bold tabular-nums">{r.quoted}</span>,
  },
  {
    key: 'activity',
    header: 'Activity',
    render: (r) => <span className="font-mono text-[11px] text-ink-3">{r.activity}</span>,
  },
  {
    key: 'action',
    header: 'Action',
    align: 'right',
    render: (r) =>
      r.status.tone === 'ink' ? (
        <AppButton variant="primary" size="sm">
          ⬇ File
        </AppButton>
      ) : (
        <AppButton variant="ghost" size="sm">
          Open
        </AppButton>
      ),
  },
];

export function TablePart() {
  return (
    <Section
      title="Table"
      description="Her dashboard's session table. Fat-outlined, ink header strip; the whole row is the click target and washes lime on hover. Generic over a row type."
    >
      <ComponentRow>
        <div className="w-full max-w-[860px]">
          <AppTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} onRowClick={() => undefined} />
        </div>
      </ComponentRow>
    </Section>
  );
}
