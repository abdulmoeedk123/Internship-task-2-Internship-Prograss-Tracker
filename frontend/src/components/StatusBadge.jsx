const STYLES = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-amber-50 text-amber-700',
  submitted: 'bg-blue-50 text-blue-700',
  completed: 'bg-brand-50 text-brand-700',
  revise: 'bg-red-50 text-red-700',
  active: 'bg-brand-50 text-brand-700',
  terminated: 'bg-red-50 text-red-700',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
