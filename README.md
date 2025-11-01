# KolamCraft Platform Design

This is a code bundle for KolamCraft Platform Design. The original project is available at https://www.figma.com/design/eDdwCKZWQ1SYwWfWEpSRSl/KolamCraft-Platform-Design.

## Features

- **Authentication**: Sign in/sign up with username-only (mock) or email/password (Supabase)
- **Real-time Image Upload**: Upload Kolam designs, stored in Supabase Storage or local data URLs
- **Likes & Comments**: Like and comment on designs with optimistic UI and real-time updates
- **Data Persistence**: Posts, likes, and comments stored in Supabase or localStorage fallback
- **Explore & Profile Pages**: Browse community designs and manage your own
- **Canvas Drawing Tool**: Create Kolam patterns with symmetry, shapes, and grid support

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration (Optional)

If you want to use Supabase for persistent storage and authentication:

1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` to `.env`
3. Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

**Note:** If you skip this step, the app will run in **local-only mode** with mock data stored in localStorage and BroadcastChannel for realtime updates.

### 3. Database Schema (Supabase only)

If using Supabase, create these tables in your SQL editor:

```sql
-- Users profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  complexity TEXT,
  grid_type TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('kolams', 'kolams', true);
```

## Running the code

Run `npm run dev` to start the development server, then open http://localhost:5173

## Usage

### Quick Start (Local Mode)

1. Click "Sign in" and enter any username (no email needed)
2. Go to Explore page and upload a Kolam image
3. Like, comment, and interact with designs
4. All data is stored locally in your browser

### With Supabase

- Full authentication with email/password
- Persistent cloud storage for images
- Real-time updates across all connected clients
- Cross-device access to your designs
