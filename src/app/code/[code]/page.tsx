import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { CopyButton } from "@/components/copy-button";
import { formatAbsolute, formatRelative } from "@/lib/dates";
import { getLinkDetails } from "@/lib/links";

export const runtime = "nodejs";

const buildBaseUrl = async () => {
  const explicit = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const headerStore = await headers();
  const host = headerStore.get("host");
  if (!host) {
    return "";
  }

  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
};

export default async function CodeStatsPage({
  params,
}: {
  params: { code: string };
}) {
  noStore();
  const link = await getLinkDetails(params.code);

  if (!link) {
    notFound();
  }

  const baseUrl = await buildBaseUrl();
  const shortUrl = baseUrl ? `${baseUrl}/${link.code}` : `/${link.code}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-sm font-medium text-sky-700 hover:text-sky-900">
          ← Back to dashboard
        </Link>
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            Stats for
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">{link.code}</h1>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total clicks" primary={link.totalClicks.toLocaleString()} />
        <StatCard
          label="Last clicked"
          primary={formatRelative(link.lastClickedAt)}
          secondary={formatAbsolute(link.lastClickedAt)}
        />
        <StatCard
          label="Created"
          primary={formatRelative(link.createdAt)}
          secondary={formatAbsolute(link.createdAt)}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Short link</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <p className="font-mono text-base text-slate-900">{shortUrl}</p>
              <CopyButton value={shortUrl} size="sm" />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">Destination</p>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block truncate text-sky-700 hover:underline"
            >
              {link.url}
            </a>
          </div>

          <dl className="grid gap-4 md:grid-cols-2">
            <Detail label="Last clicked" value={formatAbsolute(link.lastClickedAt)} />
            <Detail label="Updated at" value={formatAbsolute(link.updatedAt)} />
          </dl>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  primary,
  secondary,
}: {
  label: string;
  primary: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{primary}</p>
      {secondary && <p className="mt-1 text-sm text-slate-500">{secondary}</p>}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

