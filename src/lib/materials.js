// Material metadata used by MaterialChip / MaterialLabel / MaterialDot
// (see src/components/portal/MaterialChip.jsx). Values mirror the `material`
// Postgres enum declared in supabase/migrations/0001_schema.sql — keep them
// in sync.

export const materialMeta = {
  metal: { label: 'Scrap Metal', color: '#1B2A4A', chipBg: '#D6DEE8', chipText: '#1B2A4A' },
  paper: { label: 'Paper / Cardboard', color: '#C4956A', chipBg: '#F4E8D6', chipText: '#8A5A28' },
  electronics: { label: 'Electronics', color: '#78736A', chipBg: '#E8E5DE', chipText: '#4A4740' },
  plastic: { label: 'Plastic', color: '#6B7F5E', chipBg: '#E8EDE4', chipText: '#3F5232' },
  pallets: { label: 'Pallets', color: '#A67B50', chipBg: '#EFDFC8', chipText: '#6B4A25' },
  mixed: { label: 'Mixed / Other', color: '#DDD9D2', chipBg: '#F4F1EB', chipText: '#78736A' },
};

export const materialKeys = Object.keys(materialMeta);

export function getCompanyInitials(company) {
  if (!company) return '?';
  return company
    .replace(/,.*$/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function getPersonInitials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
