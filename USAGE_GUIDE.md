# KolamCraft - Quick Start Guide

## ✨ Features Implemented

### Backend & Data Storage

- ✅ **Supabase Integration**: Full cloud storage with automatic local fallback
- ✅ **Authentication**: Username-only mock login OR email/password with Supabase
- ✅ **Data Persistence**: Likes and comments stored in database or localStorage
- ✅ **Real-time Comments**: Live comment updates using Supabase Realtime or BroadcastChannel

### Core Features

- ✅ **Explore Feed**: Browse beautiful Kolam designs from the community with rich mock data
- ✅ **Likes System**: Like/unlike posts with optimistic UI and persistent storage
- ✅ **Comments**: Add comments to any design with real-time updates
- ✅ **Search & Filters**: Find designs by creator, tags, complexity, and grid type
- ✅ **User Profile**: View your stats and activity (basic implementation)
- ✅ **Canvas Tool**: Create Kolam patterns with drawing tools (existing feature preserved)

---

## 🚀 Getting Started

### Option 1: Local Mode (No Setup Required - Recommended for Quick Start)

1. **Start the app:**

   ```bash
   npm install
   npm run dev
   ```

2. **Open in browser:** http://localhost:3000

3. **Quick login:**

   - Click "Sign In"
   - Enter any username (e.g., "artist123")
   - Click "Sign In" - done!

4. **Try the features:**
   - Go to **Explore** page - see beautiful Kolam designs
   - Like designs by clicking the heart icon
   - Add comments by clicking the message icon
   - Search and filter designs
   - Check your **Profile** to see your activity

**How it works:** Authentication uses mock local storage. Likes and comments are stored in localStorage. The Explore page shows rich sample data from the included image assets.

---

### Option 2: With Supabase (Optional - For Cloud Features)

1. **Create a Supabase project:**

   - Go to https://supabase.com and create a free account
   - Create a new project (takes ~2 minutes)

2. **Set up the database:**

   - Open SQL Editor in Supabase dashboard
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the query (creates all tables, policies, triggers)

3. **Configure environment:**

   - Copy `.env.example` to `.env`
   - Get your project credentials from Supabase Settings > API
   - Fill in:
     ```
     VITE_SUPABASE_PROJECT_ID=your_project_id
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Start the app:**

   ```bash
   npm install
   npm run dev
   ```

5. **Register with email:**
   - Click "Sign Up"
   - Enter email, password, and username
   - Start interacting!

**Benefits:**

- ✅ Data persists across devices
- ✅ Real-time comment updates for all users
- ✅ Full authentication with password recovery

---

## 📱 Feature Walkthrough

### 1. Authentication

- **Local mode**: Just enter a username (e.g., "kolamlover")
- **Supabase mode**: Full email/password registration

### 2. Explore Kolam Designs

1. Go to **Explore** page
2. Browse through beautiful Kolam designs
3. Use the search bar to find specific designs, creators, or tags
4. Filter by:
   - **Complexity**: Beginner/Intermediate/Advanced
   - **Grid Type**: Rectangular/Triangular/Circular/Freehand
5. Sort by:
   - Most Recent
   - Most Popular
   - Most Liked

### 3. Interact with Designs

- ❤️ **Like**: Click the heart icon (persists across sessions)
- 💬 **Comment**: Click the message icon to open comments drawer
  - Add your comments
  - See all comments in real-time
- 🔖 **Save**: Click bookmark (UI indication only in current version)
- ⬇️ **Download/Print**: Hover over a design card for quick actions
- 🎨 **Practice**: Click "Practice" to open the design in Canvas mode

### 4. Comments Feature

- Click any message icon to view/add comments
- Comments drawer slides in from the right
- Add your comment and see it appear instantly
- In local mode: Comments persist in browser storage
- With Supabase: Real-time updates across all users

### 5. View Your Profile

- Click **Profile** in navigation
- See your stats: total designs, likes, comments received
- View tabs:
  - **My Posts**: Your activity (currently shows aggregated stats)
  - **Private Designs**: Reserved for future features
  - **Saved Designs**: Reserved for future features

### 6. Create Kolam Art

- Go to **Canvas** page
- Use the drawing tools:
  - Line, Curve, Freehand, Shape tools
  - Grid types (Rectangular, Triangular, Circular)
  - Symmetry modes (Vertical, Horizontal, Radial)
  - Export as PNG or PDF
- Click "Practice" on any Explore design to trace over it

---

## 🔧 Technical Architecture

### Data Flow

```
User Action → AuthContext → Local Storage (or Supabase)
                                    ↓
                          Comments/Likes Updated
                                    ↓
                            UI Refreshes
```

### Key Files

- `src/utils/dataStore.ts`: Core data layer with Supabase/localStorage abstraction
- `src/utils/supabase/client.ts`: Supabase client singleton
- `src/contexts/AuthContext.tsx`: Authentication with mock login fallback
- `src/components/ExplorePage.tsx`: Feed with likes, comments (uses mock data)
- `src/components/CommentsDrawer.tsx`: Comments UI with real-time updates
- `src/components/ProfilePage.tsx`: User profile and stats
- `src/data/exploreDesigns.ts`: Mock Kolam designs with images

---

## 🎯 What's Next?

### Future Enhancements

- [ ] Upload feature: Let users add their own Kolam designs
- [ ] Save/bookmark functionality with persistent storage
- [ ] User avatars and bio
- [ ] Follow system and activity feed
- [ ] Design templates and challenges
- [ ] Export to various formats
- [ ] Mobile app (React Native)

---

## 🐛 Troubleshooting

### "Please sign in to continue"

- Make sure you're logged in (check top-right corner)
- In local mode, just enter any username

### Comments not showing

- **Local mode**: Comments are stored per browser session
- **Supabase mode**: Check your `.env` file and database setup

### Realtime not working

- **Local mode**: Open multiple tabs to test
- **Supabase mode**: Check Realtime is enabled in your project settings

### Build warnings about chunk size

- This is normal for the large UI library bundle
- Production builds are optimized and work fine

---

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vite.dev
- **React Router**: https://reactrouter.com
- **shadcn/ui**: https://ui.shadcn.com

---

## 🎨 Happy Creating!

You now have a fully functional Kolam art platform with authentication, explore features, and social interactions. Enjoy browsing beautiful designs and adding your own comments! 🌟
