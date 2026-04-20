# Shine — Harvard International Students App

## Project Overview

**Shine** is a mobile-first React PWA for Harvard College international undergraduate students.

- **Features:** Map home (sunlight posts as pins), Community/Questions feed, Chat, Profile, Scavenger Hunt with missions/badges/leaderboard
- **Backend:** Real PostgreSQL database via Express API — logins, posts, and hunt progress all persist server-side and sync across users
- **Auth:** Email/password with scrypt hashing, UUID session tokens stored in localStorage (`shine_session`), sent via `x-session-id` header

### GitHub Repo
`https://github.com/Kaitlyn-Xie/Shine.git` — collaborator write access as `li-mingpan` via Replit GitHub integration (connection ID: `conn_github_01KNAG3VMSQNZNCPGRVESZFQVW`)

---

## Architecture

### Monorepo Structure

```
artifacts/
  shine/           — React + Vite mobile-first frontend (port 25948, path /)
  api-server/      — Express 5 REST API (port 8080, proxied at /api/)
  mockup-sandbox/  — Vite sandbox for canvas component previews (port 8081)
lib/
  db/              — Drizzle ORM schema + PostgreSQL client
  api-spec/        — OpenAPI 3.1 spec (source of truth), orval codegen config
  api-client-react/ — Generated React Query hooks + custom fetch
  api-zod/         — Generated Zod schemas for backend validation
```

### Auth Model

**No traditional auth.** Session ID = a UUID generated in the browser and stored in `localStorage` under `"x-session-id"`. Every API call sends `x-session-id` as a request header. The API server reads it from `req.headers["x-session-id"]`.

The `setAuthTokenGetter(() => getSessionId())` call in `App.tsx` wires this into all API requests via the custom fetch layer (which uses `x-session-id` header, not `Authorization: Bearer`).

---

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19, Vite, Wouter (routing), Tailwind CSS, shadcn/ui, Framer Motion
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- **Build**: esbuild (CJS bundle for API server)

---

## Database Schema

All tables in `lib/db/src/schema/`:

| Table | Purpose |
|---|---|
| `users` | session_id, displayName, pseudonym, country, role (student/mentor/admin), phase (pre_arrival/on_campus), comfort levels, circleId, totalPoints |
| `rooms` | Safe Rooms (name, slug, icon, color, postCount) |
| `posts` | Posts in rooms (userId, roomId, content, isAnonymous, tags, likeCount, replyCount, isPinned) |
| `replies` | Threaded replies on posts (isVerified flag for mentor/admin) |
| `post_likes` | Junction table for post likes |
| `resources` | Curated guides (title, summary, content, category, tags, readMinutes) |
| `circles` | Buddy circles (name, currentPrompt) |
| `circle_prompt_responses` | Circle member responses to prompts |
| `missions` | Scavenger hunt missions (type, points, location, requiresPhoto, requiresReflection) |
| `teams` | Hunt teams (name, totalPoints, memberCount) |
| `submissions` | Mission submission records (teamId, userId, photo, reflection, status) |
| `badges` | Achievement badges (name, description, icon, category) |
| `user_badges` | Junction table for earned badges |

---

## API Routes

All routes registered in `artifacts/api-server/src/routes/index.ts`:

| Router file | Path prefix | Key endpoints |
|---|---|---|
| `health.ts` | `/api/healthz` | GET health check |
| `users.ts` | `/api/users` | GET /me, PUT /me, POST /onboard, GET /me/prep-path, GET /me/badges |
| `rooms.ts` | `/api/rooms` | GET rooms, GET room by id |
| `posts.ts` | `/api/posts` | GET /rooms/:id/posts, POST /rooms/:id/posts, GET /posts/:id, POST /posts/:id/replies, POST /posts/:id/like |
| `resources.ts` | `/api/resources` | GET resources (with search/category filter), GET resource by id |
| `circles.ts` | `/api/circles` | GET /me/circle, POST /circles/:id/response |
| `missions.ts` | `/api/missions` | GET missions (with phase filter) |
| `teams.ts` | `/api/teams` | GET teams, POST /teams, POST /teams/:id/join |
| `stats.ts` | `/api/stats` | GET /stats/summary, GET /stats/activity |
| `badges.ts` | `/api/badges` | GET all badges |
| `submissions.ts` | `/api/submissions` | POST submit mission, GET /teams/:id/submissions |

---

## Frontend Pages

All pages in `artifacts/shine/src/pages/`:

| Page | Route | Phase |
|---|---|---|
| `Onboarding.tsx` | `/` | Any |
| `Home.tsx` | `/home` | Both |
| `Rooms.tsx` | `/rooms` | Both |
| `RoomDetail.tsx` | `/rooms/:id` | Both |
| `PostDetail.tsx` | `/rooms/:roomId/posts/:id` | Both |
| `Resources.tsx` | `/resources` | Both |
| `ResourceDetail.tsx` | `/resources/:id` | Both |
| `Circles.tsx` | `/circles` | Both |
| `PrepPath.tsx` | `/prep-path` | Pre-arrival |
| `Hunt.tsx` | `/hunt` | On-campus |
| `Missions.tsx` | `/hunt/missions` | On-campus |
| `MissionDetail.tsx` | `/hunt/missions/:id` | On-campus |
| `Leaderboard.tsx` | `/hunt/leaderboard` | On-campus |
| `Team.tsx` | `/hunt/team` | On-campus |
| `Badges.tsx` | `/badges` | Both |
| `Profile.tsx` | `/profile` | Both |

---

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/shine run dev` — run frontend locally

---

## Seed Data

Pre-seeded in development DB:
- **7 Safe Rooms** with icons and colors
- **6 Resource guides** (academics, finances, career, well-being)
- **12 Scavenger hunt missions** across 5 types
- **8 Badges**
- **4 Seed users** (2 mentors, 2 students) with 2 buddy circles
- **11 Sample posts** and **8 replies**

---

## Design Notes

- **Color palette**: Warm luminous — soft oranges (`#F59E0B` primary), sandy beige backgrounds, warm grays
- **Mobile-first**: Max-width 400px, fixed bottom tab nav, full-screen cards
- **Bottom tabs**: Home, Rooms, Resources, Hunt (on_campus only), Profile
- **Anonymous posting**: Users can post without their name (using pseudonym or truly anonymous)
- **Phase-gated**: Hunt tab only visible for `on_campus` users; prep path only for `pre_arrival`
