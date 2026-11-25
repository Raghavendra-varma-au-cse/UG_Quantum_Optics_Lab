export default function Loading() {
  return (
    <div className="shell py-16">
      <div className="animate-pulse">
        <div className="h-3 w-24 bg-line" />
        <div className="mt-5 h-10 w-2/3 bg-paper-3" />
        <div className="mt-3 h-3 w-1/2 bg-paper-3" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="h-64 border border-line bg-paper-2" />
          <div className="h-64 border border-line bg-paper-2" />
        </div>
      </div>
      <p className="label mt-8">Loading the laboratory…</p>
    </div>
  );
}
