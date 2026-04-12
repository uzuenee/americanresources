import { cn } from '@/utils/cn';
import { materialMeta } from '@/lib/materials';

export function MaterialDot({ material, className }) {
  const meta = materialMeta[material];
  if (!meta) return null;
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block h-2 w-2 flex-shrink-0 rounded-full', className)}
      style={{ backgroundColor: meta.color }}
    />
  );
}

export function MaterialLabel({ material, className }) {
  const meta = materialMeta[material];
  if (!meta) return null;
  return (
    <span className={cn('inline-flex items-center gap-2 font-sans text-[0.875rem] text-text-primary', className)}>
      <MaterialDot material={material} />
      {meta.label}
    </span>
  );
}

export function MaterialChip({ material, className }) {
  const meta = materialMeta[material];
  if (!meta) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-offwhite-alt px-3 py-1.5 font-sans text-[0.8125rem] font-medium text-text-primary',
        className
      )}
    >
      <MaterialDot material={material} />
      {meta.label}
    </span>
  );
}

export function MaterialDotRow({ materials, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} aria-label={`Materials: ${materials.join(', ')}`}>
      {materials.map((m) => (
        <MaterialDot key={m} material={m} />
      ))}
    </span>
  );
}
