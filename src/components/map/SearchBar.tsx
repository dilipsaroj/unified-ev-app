import { Search } from 'lucide-react';

/** Visual-only search bar. Functionality added in Week 2. */
export function SearchBar() {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4"
      style={{
        height: 48,
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-ink-4)',
        fontSize: 15,
        cursor: 'text',
      }}
      role="search"
      aria-label="Search for charging stations"
    >
      <Search size={18} color="var(--color-ink-4)" strokeWidth={2} />
      <span>Search stations, areas, connectors…</span>
    </div>
  );
}
