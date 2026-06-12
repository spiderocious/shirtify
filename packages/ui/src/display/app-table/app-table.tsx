import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

/**
 * Shirtify table — stance #28 Neobrutalist pop.
 * Visual spec: design-system/projects/shirtify/preview/21-sessions.html (.tbl)
 *
 * Fat-outlined, ink header strip, 2.5px row rules. The whole row is the click
 * target; hovering washes it lime-tint. Generic over a row type T.
 */
export interface AppTableColumn<T> {
  readonly key: string;
  readonly header: ReactNode;
  readonly align?: 'left' | 'right';
  readonly render: (row: T) => ReactNode;
}

export interface AppTableProps<T> {
  readonly columns: readonly AppTableColumn<T>[];
  readonly rows: readonly T[];
  readonly rowKey: (row: T) => string;
  readonly onRowClick?: (row: T) => void;
  readonly className?: string;
}

export function AppTable<T>({ columns, rows, rowKey, onRowClick, className }: AppTableProps<T>) {
  return (
    <table
      className={cn(
        'w-full border-separate border-spacing-0 border-3 border-ink bg-paper-warm shadow-pop',
        className,
      )}
    >
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={cn(
                'bg-ink px-3.5 py-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-paper',
                col.align === 'right' ? 'text-right' : 'text-left',
              )}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
            className={cn('group', onRowClick && 'cursor-pointer')}
          >
            {columns.map((col) => (
              <td
                key={col.key}
                className={cn(
                  'border-b-2.5 border-ink px-3.5 py-[13px] align-middle group-last:border-b-0 group-hover:bg-go-tint',
                  col.align === 'right' && 'text-right',
                )}
              >
                {col.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
