# BNI Sökningar — Current State

## What it is
A focused internal companion app for BNI Enterprise Sjuhärad. Its single job is capturing, organizing, surfacing, and sharing weekly member searches — visible to the whole team in real time, no login required.

Not a CRM. Not a portal. Not a clone of BNI Connect.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (base-ui primitives)
- Framer Motion for animations
- Supabase (Postgres + Realtime) for persistence
- React Context for state management

## Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard — week hero header, participation bar, entries grouped by member, signals, missing members |
| `/sokningar` | Archive — week tile grid (click → modal), per-member tab, text search, filters, per-week export |
| `/medlemmar` | Member grid — click card → popup modal with all searches grouped by week, hover to quick-add |

## Core Features
- Add/edit/delete search entries via modals
- Searches grouped by week and member
- One member can have multiple searches per week
- `searchText` is the only required content field
- Retroactive entry to older weeks via custom week picker (spinner + typeable input)
- "Spara & lägg till en till" auto-advances to the next member in sorted order
- Rule-based weekly signals (geography, industry, member activity, common terms)
- Copy-to-clipboard weekly export (Messenger/chat friendly)
- Real-time updates via Supabase Realtime — all team members see changes instantly
- Skeleton loading state on first fetch
- Member avatars with consistent per-person accent colors (hashed from name)
- Members sorted by last name (Å first, then A–Ö using Swedish locale)
- 23 real BNI Enterprise Sjuhärad members seeded in Supabase

## Data Layer
All data access goes through `src/lib/store.ts` which wraps the Supabase client. Snake_case DB columns are mapped to camelCase TypeScript types.

**Supabase tables:**
- `members` — id (uuid), name, company_name, active (RLS disabled)
- `search_entries` — id (uuid), member_id (fk), week_key, search_text, contact_person?, geography?, industry?, note?, created_at, updated_at (RLS disabled)

**TypeScript models:**
- `Member` — id, name, companyName, active
- `SearchEntry` — id, weekKey, weekLabel, year, weekNumber, memberId, searchText, contactPerson?, geography?, industry?, note?, createdAt, updatedAt

## Key Files

```
src/
├── app/
│   ├── layout.tsx              # Root layout — sidebar, AppProvider, Satoshi font, BNI favicon
│   ├── globals.css             # Theme tokens, Satoshi font-family, base styles (17px base)
│   ├── page.tsx                # Dashboard
│   ├── sokningar/page.tsx      # Sökningar archive
│   └── medlemmar/page.tsx      # Medlemmar grid
├── components/
│   ├── sidebar.tsx             # 256px fixed sidebar, framer-motion stagger, "Live" status indicator
│   ├── topbar.tsx              # Sticky topbar, animated CTA button
│   ├── add-search-modal.tsx    # Add entry — custom WeekPicker, auto-advances member on "Spara & lägg till en till"
│   ├── edit-search-modal.tsx   # Edit/delete entry
│   ├── weekly-overview-modal.tsx  # Week detail — entries grouped by member
│   └── member-searches-modal.tsx  # Member detail — all searches grouped by week
├── utils/supabase/
│   ├── client.ts               # Browser Supabase client
│   ├── server.ts               # Server Supabase client
│   └── middleware.ts           # Session refresh helper
└── lib/
    ├── types.ts            # Type definitions
    ├── store.ts            # Data layer (Supabase)
    ├── context.tsx         # React context — async state, Supabase Realtime subscription
    ├── member-color.ts     # Deterministic per-member accent color from name hash
    ├── seed-data.ts        # Member reference data (kept for reference)
    ├── signals.ts          # Rule-based veckans signaler
    ├── export.ts           # Weekly text export generator
    └── week-utils.ts       # ISO week helpers (makeWeekKey, parseWeekKey, getWeeksInYear etc.)
```

## Design System
- **Theme:** Dark, near-black bg (`oklch(0.12)`), BNI crimson primary (`oklch(0.55 0.22 25)`), warm-white text
- **Font:** Satoshi (loaded via Fontshare `<link>`), 17px base, `font-weight: 460`, Inter as fallback
- **Sidebar:** 256px fixed, staggered entrance animation, spring hover on nav items
- **Animations:** Framer Motion throughout — stagger lists, spring buttons, `AnimatePresence` slide on week picker, `useReducedMotion` guard everywhere
- **Button fill sweep:** Default variant buttons have a white fill sweep left→right on hover, text transitions to `text-primary`
- **Member avatars:** 10-color palette, color deterministically assigned by hashing member name — consistent across all pages
- **Participation bar:** Gradient red → rose → amber
- **Badges:** 📍 geography, 🏷️ industry
- **Dashboard layout:** Two-column split (main feed + right rail), week number is the hero element
- **Sökningar:** Week tiles in a responsive grid (2–4 cols), click → `WeeklyOverviewModal`
- **Medlemmar:** Card grid (2–3 cols), sorted by last name (Å first), click → `MemberSearchesModal`

## Deployment
- GitHub: [github.com/HaiDaPlug/bni-references](https://github.com/HaiDaPlug/bni-references)
- Supabase project: `mwvmgemkfejnnakvotkj`
- Env vars needed on host: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## What's NOT built yet
- Deployment to Vercel (env vars need to be added)
- AI-powered veckans signaler (current engine is rule-based, interface is ready for AI swap)
- SearchEntry revision history (overwrite works, no change history)
- BNI Connect member sync/import
- PDF export / presentation mode
- Multi-chapter support

## Next Steps (priority order)
1. Deploy to Vercel — add env vars, point domain
2. AI-powered veckans signaler — upgrade `generateSignals()` internals
3. Export enhancements (PDF, presentation mode)
