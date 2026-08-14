export function LoadingState() {
  return <div className="py-12 text-center text-sm text-slate-500">Loading…</div>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{message}</div>
  );
}
