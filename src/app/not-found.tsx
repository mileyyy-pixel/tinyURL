import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm uppercase tracking-wide text-slate-500">404</p>
      <h1 className="text-3xl font-semibold text-slate-900">
        We couldn&apos;t find that short link
      </h1>
      <p className="max-w-md text-base text-slate-500">
        The code you entered may have been deleted or never existed. Head back
        to the dashboard to create a new short link.
      </p>
      <Link
        href="/"
        className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
      >
        Go to dashboard
      </Link>
    </div>
  );
}


