import { cn } from '@/utils/cn';

const STATUS_STYLES = {
  active: { bg: 'bg-sage-light', text: 'text-[#3F5232]', label: 'Active' },
  pending: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', label: 'Pending' },
  pilot: { bg: 'bg-[#EFDFC8]', text: 'text-copper-dark', label: 'Pilot' },
  under_review: { bg: 'bg-[#EFDFC8]', text: 'text-copper-dark', label: 'Under Review' },
  scheduled: { bg: 'bg-sage-light', text: 'text-[#3F5232]', label: 'Scheduled' },
  completed: { bg: 'bg-success/15', text: 'text-success', label: 'Completed' },
  overdue: { bg: 'bg-accent-light', text: 'text-danger', label: 'Overdue' },
};

export function StatusBadge({ status, children, className }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.under_review;
  const label = children || style.label;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.08em]',
        style.bg,
        style.text,
        className
      )}
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
}
