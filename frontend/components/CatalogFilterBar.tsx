'use client';

export interface FilterChip {
  id: string;
  label: string;
}

interface CatalogFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (id: string) => void;
  chips: FilterChip[];
  searchPlaceholder: string;
  scrollChips?: boolean;
}

export default function CatalogFilterBar({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  chips,
  searchPlaceholder,
  scrollChips,
}: CatalogFilterBarProps) {
  return (
    <div className="catalog-filters">
      <input
        type="search"
        className="search-bar"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className={`filter-chips ${scrollChips ? 'filter-chips--scroll' : ''}`}>
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`chip ${activeFilter === chip.id ? 'active' : ''}`}
            onClick={() => onFilterChange(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
