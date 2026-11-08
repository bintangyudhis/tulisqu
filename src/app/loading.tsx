export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-busy="true">
      <div className="h-3 w-24 bg-line" />
      <div className="mt-4 h-9 w-3/4 bg-line" />
      <div className="mt-4 h-5 w-1/2 bg-line" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-10">
          <div className="h-40 bg-line/60" />
          <div className="h-56 bg-line/60" />
        </div>
        <div className="h-96 bg-line/60" />
      </div>
      <p className="sr-only">Memuat halaman…</p>
    </div>
  );
}
