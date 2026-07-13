# H&D Workshop Tracker Deployment

## Supabase setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run `supabase/001_initial_schema.sql`.
4. Run `supabase/002_seed_data.sql`.
5. In Authentication, enable the Email provider.
6. Create workshop users through the app signup form or Supabase Auth Users.
7. Supported roles are:
   - Owner
   - Manager
   - Production
   - Driver
8. In Project Settings, copy:
   - Project URL
   - anon public key
9. Create `.env.local` from `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The database uses Supabase Auth and Row Level Security. Only authenticated users can CRUD workshop records. Work-order `created_by` and `updated_by` audit fields are populated by database triggers from the authenticated user id.

## Local development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist`.

## Vercel deployment

1. Push this project to a Git repository.
2. Import the repository in Vercel.
3. Use these settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables in Vercel Project Settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

After deployment, open the Vercel URL and confirm:

- Email login works.
- Work orders load from Supabase.
- Dragging a card between Kanban stages updates the status.
- Status history is written.
- Customer, supplier, worker, quote, and repair records can be created, edited, and deleted.
- Work order image upload writes to Supabase Storage.
- Work-order detail shows created/modified audit users.
