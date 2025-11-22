"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { formatAbsolute, formatRelative } from "@/lib/dates";
import type { LinkDto } from "@/lib/links";
import { createLinkSchema } from "@/lib/validation";

type DashboardProps = {
  fallbackBaseUrl?: string;
};

type FormState = {
  url: string;
  code: string;
};

const DEFAULT_FORM_STATE: FormState = {
  url: "",
  code: "",
};

const getOrigin = (fallback?: string) => {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return fallback ?? "";
};

const shortUrlFor = (code: string, baseUrl?: string) => {
  const origin = getOrigin(baseUrl);
  if (!origin) {
    return `/${code}`;
  }

  return `${origin.replace(/\/$/, "")}/${code}`;
};

const summarizeClicks = (links: LinkDto[]) =>
  links.reduce((sum, link) => sum + link.totalClicks, 0);

export function Dashboard({ fallbackBaseUrl }: DashboardProps) {
  const [links, setLinks] = useState<LinkDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await fetch("/api/links", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load links. Please try again.");
      }

      const payload = (await response.json()) as { links: LinkDto[] };
      setLinks(payload.links ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setFetchError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  const filteredLinks = useMemo(() => {
    if (!search.trim()) {
      return links;
    }

    const query = search.trim().toLowerCase();
    return links.filter(
      (link) =>
        link.code.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query),
    );
  }, [links, search]);

  const totalClicks = summarizeClicks(links);
  const latestLink = links.at(0);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const parsed = createLinkSchema.safeParse(formState);

    if (!parsed.success) {
      const message = parsed.error.issues.at(0)?.message ?? "Invalid payload";
      setFormError(message);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const payload = (await response.json()) as {
        link?: LinkDto;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create link right now.");
      }

      if (payload.link) {
        setLinks((prev) => [payload.link!, ...prev]);
      }

      setFormState(DEFAULT_FORM_STATE);
      setFormSuccess("Link created successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create link.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (code: string) => {
    const confirmed = window.confirm(
      `Delete ${code}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingCode(code);
    setFetchError(null);

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete link.");
      }

      setLinks((prev) => prev.filter((link) => link.code !== code));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete link.";
      setFetchError(message);
    } finally {
      setDeletingCode(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Active links"
          value={links.length.toString()}
          subtext="Codes currently available"
        />
        <SummaryCard
          title="Lifetime clicks"
          value={totalClicks.toLocaleString()}
          subtext="Across every link"
        />
        <SummaryCard
          title="Latest link"
          value={latestLink ? formatRelative(latestLink.createdAt) : "—"}
          subtext={
            latestLink
              ? formatAbsolute(latestLink.createdAt)
              : "Create your first link to get started"
          }
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Create a short link
            </h2>
            <p className="text-sm text-slate-500">
              Enter a destination URL and optionally reserve a custom code.
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-sky-700 hover:text-sky-900"
            onClick={() => void loadLinks()}
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-800" htmlFor="url">
              Destination URL
            </label>
            <input
              id="url"
              name="url"
              type="url"
              required
              autoComplete="off"
              placeholder="https://example.com/product"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              value={formState.url}
              onChange={handleChange}
            />
            <p className="mt-1 text-xs text-slate-500">
              We automatically prepend https:// if the protocol is missing.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800" htmlFor="code">
              Custom code (optional)
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="text"
              maxLength={8}
              placeholder="e.g. launch24"
              value={formState.code}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm placeholder:italic focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              6-8 letters or numbers. Leave blank to generate a random code.
            </p>
          </div>

          {formError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {formError}
            </p>
          )}

          {formSuccess && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {formSuccess}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-base font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Shorten URL"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Your links
            </h2>
            <p className="text-sm text-slate-500">
              Search, copy, or delete existing short codes.
            </p>
          </div>
          <input
            type="search"
            placeholder="Search by code or URL"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 md:w-80"
          />
        </div>

        {fetchError && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {fetchError}
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">Short code</th>
                <th className="px-4 py-3">Target URL</th>
                <th className="px-4 py-3">Total clicks</th>
                <th className="px-4 py-3">Last clicked</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-3 w-24 rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3 w-48 rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3 w-8 rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3 w-24 rounded bg-slate-200" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="ml-auto h-8 w-24 rounded bg-slate-200" />
                    </td>
                  </tr>
                ))}

              {!isLoading && filteredLinks.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>
                    {links.length === 0
                      ? "No links yet. Create your first short link above."
                      : "No links match that search query."}
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredLinks.map((link) => (
                  <tr key={link.code} className="align-top">
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/code/${link.code}`}
                          className="font-semibold text-slate-900 hover:text-sky-700"
                        >
                          {link.code}
                        </Link>
                        <span className="text-xs text-slate-500">
                          {shortUrlFor(link.code, fallbackBaseUrl)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block max-w-xs truncate text-sky-700 hover:underline md:max-w-md"
                        title={link.url}
                      >
                        {link.url}
                      </a>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {link.totalClicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-900">
                        {formatRelative(link.lastClickedAt)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatAbsolute(link.lastClickedAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-end gap-2 md:flex-row">
                        <CopyButton
                          value={shortUrlFor(link.code, fallbackBaseUrl)}
                          size="sm"
                        />
                        <button
                          type="button"
                          className="text-sm font-medium text-red-600 hover:text-red-800 disabled:text-red-300"
                          onClick={() => void handleDelete(link.code)}
                          disabled={deletingCode === link.code}
                        >
                          {deletingCode === link.code ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: string;
  subtext: string;
};

function SummaryCard({ title, value, subtext }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{subtext}</p>
    </div>
  );
}

