import { Dashboard } from "@/components/dashboard";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          TinyLink
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">
          Short links with instant insights
        </h1>
        <p className="mt-2 max-w-2xl text-base text-slate-500">
          Create branded short codes, monitor clicks, and keep tabs on every
          important URL from a single dashboard.
        </p>
      </div>
      <Dashboard fallbackBaseUrl={baseUrl} />
    </section>
  );
}
