# Supabase Setup Instructions (Required for Admin to work)

## 1. Create the `profile` table

Go to your Supabase project → SQL Editor → New query → paste this and run:

```sql
-- Drop if you want to start fresh (optional)
-- DROP TABLE IF EXISTS profile;

CREATE TABLE profile (
  id TEXT PRIMARY KEY DEFAULT 'default',
  avatar_url TEXT,
  name TEXT,
  title TEXT,
  subtitle TEXT,
  bio TEXT,
  skills TEXT[],                    -- Array of strings
  linkedin TEXT,
  github TEXT,
  portfolio TEXT,
  facebook TEXT,
  instagram TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the initial default row (so public card works immediately)
INSERT INTO profile (id, avatar_url, name, title, subtitle, bio, skills, linkedin, github, portfolio, facebook, instagram, email, phone, whatsapp)
VALUES (
  'default',
  'https://github.com/ahmede2test.png',
  'Ahmed Osman ELsisi',
  'IT Specialist',
  'IT Technical Support &middot; Orascom Construction (Contrack&nbsp;FM) &middot; Flutter Expert &middot; Mobile App Developer',
  'Architecting and developing smart, high-performance mobile applications with premium, user-centric UI/UX design layouts. Explore my professional networks and connect with me directly.',
  ARRAY['Flutter', 'App Developer', 'MySQL', 'API Integration', 'IT Support'],
  'https://www.linkedin.com/in/ahmed-osman22',
  'https://github.com/ahmede2test',
  'https://ahmed-osman-portfolio.vercel.app/',
  'https://www.facebook.com/share/18tkT6hhhc/',
  'https://www.instagram.com/eng_ahmed_el_sisiy?igsh=dW1pbHU1M2E0cG50',
  'ahmed.osmanis.fcai@gmail.com',
  '+201027451231',
  '201027451231'
)
ON CONFLICT (id) DO NOTHING;
```

## 2. Enable Row Level Security (RLS) — Recommended

Run this after creating the table:

```sql
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- Allow anyone to READ the profile (public card)
CREATE POLICY "Allow public read" 
ON profile FOR SELECT 
USING (true);

-- Allow anyone to INSERT / UPDATE the single default row (for admin panel)
-- (In production you can make this more secure with service role or auth)
CREATE POLICY "Allow upsert default profile" 
ON profile FOR INSERT 
WITH CHECK (id = 'default');

CREATE POLICY "Allow update default profile" 
ON profile FOR UPDATE 
USING (id = 'default')
WITH CHECK (id = 'default');
```

## 3. Create Storage Bucket for Avatar Uploads

1. Go to Storage in Supabase dashboard
2. Create a new bucket named exactly: **avatars**
3. Make it **Public** (important)
4. No other settings needed for now.

Then the admin panel can upload photos directly.

## 4. How to use

- Public card: open your site at `/`  (loads live data from DB)
- Admin panel: go to `/admin`
  - Default password: `admin2026`  ← **CHANGE THIS** inside `src/Admin.tsx`
- After saving in admin, refresh the public card — it will show the new data instantly.

## 5. Important Notes

- The public card now is 100% dynamic from Supabase (avatar, name, bio, skills, ALL links, phone, whatsapp).
- Original beautiful UI, animations, layout, and design are **completely unchanged**.
- Tiny ⚙ icon in the footer of the card links to /admin (only visible on close inspection, doesn't affect design).
- You can also directly visit yoursite.com/admin

## 6. Change Admin Password (Security)

Open `src/Admin.tsx`, find this line near the top:

```ts
const ADMIN_PASSWORD = "admin2026"; // Change this to your secret password
```

Change it to something strong and redeploy.

---

Your Supabase keys are already correctly wired in `src/supabaseClient.ts`.

Enjoy full control! 🚀
