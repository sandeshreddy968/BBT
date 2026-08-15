export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-5 first:pt-0 last:border-b-0 last:pb-0">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
