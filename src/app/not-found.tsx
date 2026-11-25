import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] flex-col justify-center py-16">
      <p className="label mb-3 text-vermilion">404 · not on the bench</p>
      <h1 className="display-xl max-w-2xl">This path does not exist.</h1>
      <p className="mt-4 max-w-lg text-[0.85rem] leading-relaxed text-muted">
        The experiment or component you requested is not in this laboratory. Check the index; a route that refers to an
        unverified configuration is not silently created.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/experiments" className="btn">Experiment index</Link>
        <Link href="/components" className="btn btn-ghost">Component library</Link>
      </div>
    </div>
  );
}
