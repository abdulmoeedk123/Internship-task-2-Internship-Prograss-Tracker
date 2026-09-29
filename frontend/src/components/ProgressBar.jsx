export default function ProgressBar({ value, size = 'md' }) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className="w-full">
      <div className={`w-full overflow-hidden rounded-full bg-slate-100 ${height}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
