# H&D Workshop Tracker

Mobile-first MVP for fabrication and repair work orders.

## Features

- Login screen for Owner, Workshop Manager, and Production Supervisor roles
- Real drag-and-drop Dashboard Kanban using `@dnd-kit/core`
- Create work order form
- Work order detail page
- Status updates with history
- Image upload preview stored locally in the browser
- Customer management
- Supplier management
- Worker management
- Quote history
- Repair case library
- Cost tracking and profit analysis
- Supabase SQL migration and seed data
- Supabase database CRUD API layer
- Supabase Storage image upload
- Supabase realtime refresh
- Supabase Auth email login
- Roles: Owner, Manager, Production, Driver
- Authenticated-only Row Level Security
- Work-order created/modified audit tracking
- Vercel deployment configuration

## Run locally

Open `index.html` directly in a browser, or run a static server:

```bash
npm install
npm run dev
```

Then visit `http://localhost:5173`.

## Supabase

Run the SQL files in order:

1. `supabase/001_initial_schema.sql`
2. `supabase/002_seed_data.sql`

Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` plus `VITE_SUPABASE_ANON_KEY`.

Enable Supabase Auth email login, then create users through the app signup form or Supabase Auth. All workshop CRUD operations require an authenticated user.

See `DEPLOYMENT.md` for local setup, production build, and Vercel deployment steps.
