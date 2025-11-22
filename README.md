# TinyLink

TinyLink is a lightweight URL shortener inspired by bit.ly. It lets anyone create branded short links, view click analytics, and manage their catalog from a single dashboard. The project satisfies the TinyLink take-home assignment requirements:

- `/` dashboard for creating, listing, filtering, copying, and deleting links.
- `/code/:code` stats detail view.
- `/:code` redirect endpoint that increments click counters.
- `/healthz` JSON healthcheck.
- Full REST API under `/api/links`.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, serverless-friendly APIs)
- [Tailwind CSS](https://tailwindcss.com) for lightweight styling
- [Prisma ORM](https://www.prisma.io) + Postgres (Neon/Railway/Render compatible)
- [TypeScript](https://www.typescriptlang.org) end-to-end

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Duplicate `.env.example` into `.env` and fill in your values:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/tinylink?sslmode=require
NEXT_PUBLIC_BASE_URL=https://your-tinylink.vercel.app
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Apply database schema

```bash
npx prisma migrate deploy
# or, for local dev only:
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
# Visit http://localhost:3000
```

### 5. Helpful scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Next.js locally |
| `npm run build` | Production build |
| `npm run start` | Run built app |
| `npm run lint` | TypeScript + ESLint |
| `npx prisma studio` | Inspect the database |

## API Reference

All responses are JSON and follow the assignment spec.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/links` | List all links, newest first |
| `POST` | `/api/links` | Create link (`409` on duplicate code) |
| `GET` | `/api/links/:code` | Fetch stats for one link |
| `DELETE` | `/api/links/:code` | Remove a link |
| `GET` | `/code/:code` | Stats page (UI) |
| `GET` | `/:code` | 302 redirect + click tracking |
| `GET` | `/healthz` | `{ ok: true, version, uptimeSeconds }` |

### Create Link

```http
POST /api/links
Content-Type: application/json

{
  "url": "https://example.com/docs",
  "code": "docs24" // optional; auto-generated when omitted
}
```

Successful response:

```json
{
  "link": {
    "code": "docs24",
    "url": "https://example.com/docs",
    "totalClicks": 0,
    "lastClickedAt": null,
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z",
    "id": "clxyz..."
  }
}
```

### Healthcheck

```
GET /healthz -> 200 OK
{ "ok": true, "version": "1.0.0", "uptimeSeconds": 123 }
```

## Deployment Notes

1. Provision a managed Postgres instance (e.g., [Neon](https://neon.tech)).
2. Set `DATABASE_URL` and `NEXT_PUBLIC_BASE_URL` in your hosting provider (Vercel/Render/Railway).
3. Run `npx prisma migrate deploy` against the production database.
4. Deploy the Next.js project (Vercel import recommended).
5. Update this README with:
   - ✅ Production URL
   - ✅ GitHub repository URL
   - ✅ Loom/video walkthrough
   - ✅ ChatGPT/LLM transcript link

## Testing

- `npm run lint` — static analysis (ESLint + TypeScript strict mode)
- Manual testing checklist:
  - `/healthz` returns `200`
  - Create + duplicate code rejection flow
  - Redirect increments counters
  - Delete removes link and redirect returns `404`
  - Dashboard states: loading, empty, active, error

## Deliverables Checklist

- [ ] Hosted app URL: `https://your-tinylink.vercel.app`
- [ ] GitHub repo URL
- [ ] Video walkthrough link
- [ ] LLM transcript link

Update the placeholders above before submitting the assignment. Good luck!
