# BNI Referencer — Current State

## What it is
A focused internal companion app for one local BNI chapter. Its single job is capturing, organizing, surfacing, and sharing weekly member searches.

Not a CRM. Not a portal. Not a clone of BNI Connect.

## Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (base-ui primitives)
- Framer Motion for animations
- localStorage for persistence (Supabase-ready abstraction)
- React Context for state management

## Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard — week hero header, participation bar, entries grouped by member, signals, missing members |
| `/sokningar` | Archive — week tile grid (click → modal), per-member tab, text search, filters, per-week export |
| `/medlemmar` | Member grid — click card → popup modal with all searches grouped by week, hover to quick-add |

## Core Features (v1)
- Add/edit/delete search entries via modals
- Searches grouped by week and member
- One member can have multiple searches per week
- `searchText` is the only required content field
- Retroactive entry to older weeks via custom week picker (spinner + typeable input)
- Rule-based weekly signals (geography, industry, member activity, common terms)
- Copy-to-clipboard weekly export (Messenger/chat friendly)
- Seed data: 23 real BNI Enterprise Sjuhärad members, 20 searches across 3 weeks

## Data Layer
All data access goes through `src/lib/store.ts` which wraps localStorage. The interface is designed so swapping to Supabase later only requires changing the store internals — no UI changes needed.

**Models:**
- `Member` — id, name, companyName, active
- `SearchEntry` — id, weekKey, weekLabel, year, weekNumber, memberId, searchText, contactPerson?, geography?, industry?, note?, createdBy?, createdAt, updatedAt
- Seed versioning via `bni-initialized-v2` key ensures re-seed on member data changes

## Key Files

```
src/
├── app/
│   ├── layout.tsx              # Root layout — sidebar, AppProvider, Satoshi font via <link>
│   ├── globals.css             # Theme tokens, Satoshi font-family, base styles
│   ├── page.tsx                # Dashboard
│   ├── sokningar/page.tsx      # Sökningar archive
│   └── medlemmar/page.tsx      # Medlemmar grid
├── components/
│   ├── sidebar.tsx             # 256px fixed sidebar, framer-motion stagger on nav items
│   ├── topbar.tsx              # Sticky topbar, animated CTA button
│   ├── add-search-modal.tsx    # Add entry — custom WeekPicker (spinner + typeable week number)
│   ├── edit-search-modal.tsx   # Edit/delete entry
│   ├── weekly-overview-modal.tsx  # Week detail — entries grouped by member
│   └── member-searches-modal.tsx  # Member detail — all searches grouped by week
└── lib/
    ├── types.ts            # Type definitions
    ├── store.ts            # Data layer (localStorage, Supabase-ready)
    ├── context.tsx         # React context for app state
    ├── seed-data.ts        # Realistic demo data
    ├── signals.ts          # Rule-based veckans signaler
    ├── export.ts           # Weekly text export generator
    └── week-utils.ts       # ISO week helpers (makeWeekKey, parseWeekKey, getWeeksInYear etc.)
```

## Design System
- **Theme:** Dark, near-black bg (`oklch(0.12)`), BNI crimson primary (`oklch(0.55 0.22 25)`), warm-white text
- **Font:** Satoshi (loaded via Fontshare `<link>`), 15px base, `font-weight: 450`, Inter as fallback
- **Sidebar:** 256px fixed, staggered entrance animation, spring hover on nav items
- **Animations:** Framer Motion throughout — stagger lists, spring buttons, `AnimatePresence` slide on week picker, `useReducedMotion` guard everywhere
- **Dashboard layout:** Two-column split (main feed + right rail), no stat cards — week number is the hero element
- **Sökningar:** Week tiles in a responsive grid (2–4 cols), click → `WeeklyOverviewModal`
- **Medlemmar:** Card grid (2–3 cols), click → `MemberSearchesModal` popup
- **Modals:** `bg-black/60` backdrop with `backdrop-blur-sm`, dark popover bg
- **Form inputs:** `bg-card` + explicit `text-foreground` to prevent OS light-theme override on `<select>`

## What's NOT built yet
- Authentication / user accounts (v2)
- Supabase backend
- AI-powered veckans signaler (current engine is rule-based, interface is ready for AI swap)
- SearchEntryRevision model (overwrite works, no change history)
- BNI Connect member sync/import
- PDF export / presentation mode
- Multi-chapter support

## Next Steps (priority order)
1. Supabase integration — swap localStorage store for real database, enables multi-user
2. AI-powered veckans signaler — upgrade `generateSignals()` internals
3. Auth + user accounts (v2)
4. Export enhancements (PDF, presentation mode)
