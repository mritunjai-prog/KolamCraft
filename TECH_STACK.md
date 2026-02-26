# KolamCraft — Tech Stack Q&A

A complete reference for explaining the technology choices behind KolamCraft.

---

## CORE FRAMEWORK

**Q: What framework is KolamCraft built on?**

> **React 18** with **TypeScript**. React handles the UI as a component tree. TypeScript adds static typing so we catch bugs at compile time instead of runtime.

**Q: Why React and not Vue or Angular?**

> React's component model fits perfectly for this project — the kolam canvas, generator controls, and gallery cards are all independent reusable pieces. The ecosystem (Framer Motion, shadcn/ui, React Router) is also the richest for what we needed.

**Q: What version of React?**

> React **18.3.1** — uses the concurrent rendering engine, which makes animations and large gallery loads smoother.

---

## BUILD TOOL

**Q: How is the project compiled and served?**

> **Vite 5.4** with the **@vitejs/plugin-react-swc** plugin. SWC is a Rust-based compiler — it's 20–70× faster than Babel for hot module replacement.

**Q: Why Vite over Create React App or Webpack?**

> Vite uses native ES modules in development so only changed files are recompiled. Build times are under 500ms for dev server startup. CRA is deprecated; Webpack is much slower.

**Q: How do you build for production?**

> `npm run build` — Vite bundles and tree-shakes everything into the `dist/` folder. Output is optimised, minified, and split into chunks.

---

## LANGUAGE

**Q: What language is used?**

> **TypeScript 5.8** — a superset of JavaScript. Every component, function, and data structure has types. For example, `KolamPattern`, `Stroke`, `Point` are all typed interfaces.

**Q: Where does TypeScript help most in this project?**

> The kolam generator — types ensure the pattern engine always returns a valid `KolamPattern` object with `dots`, `curves`, and `dimensions`. Without types, a mismatched property would silently break the SVG renderer.

---

## STYLING

**Q: How is the UI styled?**

> **Tailwind CSS v3.4** — a utility-first CSS framework. Instead of writing `.button { background: orange; }` in a separate file, classes like `bg-primary rounded-xl px-4` are written directly in JSX.

**Q: What is the design token system?**

> Custom **HSL CSS variables** defined in `index.css`. For example:
>
> - `--primary: 22 88% 62%` → warm orange
> - `--background: 20 20% 6%` → near-black
> - `--foreground: 33 20% 90%` → creamy white
>
> Every Tailwind class like `bg-primary` or `text-foreground` maps to these variables, so swapping light/dark mode is just toggling one CSS class on `<html>`.

**Q: How does light/dark mode work?**

> A **ThemeContext** (`React.createContext`) stores the current theme. Toggling the sun/moon button in the navbar adds or removes the `.light` class on `document.documentElement`. The `.light` class in CSS overrides the root variables to creamy/brown tones. The choice is persisted in `localStorage`.

**Q: What are the glass-morphism effects?**

> Custom CSS utility classes in `index.css`:
>
> - `.glass` → `background: rgba(...)` + `backdrop-filter: blur(12px)` + subtle border
> - `.glass-strong` → heavier blur for overlapping panels
> - These are adaptive — lighter/darker in light vs dark mode

**Q: What fonts are used?**

> - **Playfair Display** (Google Fonts) — serif, used for the "KolamCraft" brand wordmark. Chosen for its cultural elegance.
> - **Inter** — clean sans-serif for all UI text (labels, buttons, body copy).

---

## ANIMATIONS

**Q: How are animations done?**

> **Framer Motion 11** — a React animation library. Used for:
>
> - Page entrance animations (`initial`, `animate`, `exit` props)
> - The hero word-cycling animation (clipPath + y transform)
> - 3D card tilt on the Login page (`useMotionValue`, `useTransform`)
> - Hamburger menu slide-down (`AnimatePresence`)
> - Explore gallery card stagger reveals
> - Parallax scroll on the hero image (`useScroll`, `useTransform`)

**Q: How does the kolam draw animation work?**

> SVG `stroke-dashoffset` animation. Each path has its full length set as `stroke-dasharray`, then a CSS `@keyframes drawCurve` animation reduces `stroke-dashoffset` from full-length to `0` — making it look like it's being drawn stroke by stroke.

---

## UI COMPONENTS

**Q: Where do the UI components (buttons, sliders, dropdowns) come from?**

> **shadcn/ui** — not a traditional npm component library. It's a collection of copy-pasted, fully customisable components built on top of **Radix UI** primitives. The source code lives directly in `src/components/ui/`.

**Q: What is Radix UI?**

> Radix UI provides unstyled, accessible component primitives — things like `@radix-ui/react-dialog`, `@radix-ui/react-slider`, `@radix-ui/react-select`. They handle keyboard navigation, ARIA roles, and focus management. shadcn/ui wraps them with Tailwind styling.

**Q: What icon library is used?**

> **Lucide React 0.462** — a clean, consistent SVG icon set. Used throughout: `Sparkles`, `Sun`, `Moon`, `Menu`, `X`, `Download`, `Play`, `Square`, `ArrowLeft`, etc.

---

## ROUTING

**Q: How does page navigation work?**

> **React Router v6.30** — client-side routing. Routes defined in `App.tsx`:
>
> - `/` → Landing page
> - `/canvas` → Canvas Studio
> - `/generator` → Kolam Generator
> - `/explore` → Design Gallery
> - `/login` → Login page
> - `*` → 404 Not Found

**Q: Why does `vercel.json` have a rewrite rule?**

> SPAs (Single Page Apps) serve everything from `index.html`. When you directly visit `kolamcraft.vercel.app/generator`, the server looks for a `/generator` file — which doesn't exist. The rewrite `"source": "/(.*)" → "/index.html"` tells Vercel to always serve `index.html` and let React Router handle the path.

---

## KOLAM ENGINE

**Q: How are kolam patterns generated?**

> A custom **1D Kolam Algorithm** in `src/kolam-generator/utils/kolamGenerator.ts`. Steps:
>
> 1. An `n×n` dot grid is initialised (size 3–15, user-controlled)
> 2. A 1-dimensional cellular automaton rule is applied to determine curve connectivity
> 3. Curves are traced around dot clusters following traditional kolam rules — every dot must be enclosed by passing lines
> 4. Output is a `KolamPattern` object with typed `dots[]` and `curves[]`

**Q: How is the pattern rendered to screen?**

> `KolamDisplay.tsx` takes a `KolamPattern` and renders a plain **SVG element** — `<circle>` for dots and `<path>` / `<line>` for curves. Uses `currentColor` so it adapts to light/dark mode automatically.

**Q: How does SVG/PNG export work?**

> `KolamExporter.ts`:
>
> - **SVG export**: serialises the pattern data back into an SVG string and triggers a download via a Blob URL
> - **PNG export**: uses **html2canvas 1.4** to rasterise the canvas DOM node to a `<canvas>` element, then exports as PNG
> - **Copy SVG**: writes the SVG string to `navigator.clipboard`

---

## CANVAS DRAWING

**Q: How does the freehand drawing canvas work?**

> `CanvasPage.tsx` uses the native **HTML5 Canvas API** (`<canvas>` + `getContext('2d')`). Drawing tools:
>
> - **Freehand / Curve**: collects pointer points into an array, draws quadratic Bézier curves through them
> - **Line**: snaps to nearest dot grid point
> - **Shape**: circle, diamond, triangle, square with radius from drag distance
> - **Fill**: flood-fill algorithm using pixel-by-pixel BFS on `ImageData`
> - **Eraser**: `destination-out` composite operation

**Q: Does it work on touchscreens and tablets?**

> Yes — touch events (`onTouchStart`, `onTouchMove`, `onTouchEnd`) are handled alongside mouse events. Touch coordinates are extracted from `e.touches[0]` and scaled to canvas space. `touch-action: none` prevents accidental page scrolling while drawing.

**Q: How does symmetry work?**

> An `applySymmetry(point)` function mirrors input coordinates:
>
> - **Vertical**: reflects X around canvas centre
> - **Horizontal**: reflects Y around canvas centre
> - **Radial**: generates 4 rotated copies at 90° intervals
>   Every stroke is drawn once per symmetry axis simultaneously.

**Q: How is undo/redo implemented?**

> A `history` array stores snapshots of the `strokes[]` array. Each confirmed stroke pushes a new snapshot. Undo pops one back; redo moves forward. Implemented entirely in React state — no external library.

---

## EXPLORE GALLERY

**Q: How are the 600+ design images loaded?**

> **Vite's `import.meta.glob`** — a build-time feature that scans the filesystem and imports all matching files:
>
> ```js
> import.meta.glob("../assets/*.{jpg,jpeg,png,webp}", { eager: true });
> ```
>
> This generates no runtime filesystem calls — Vite resolves all paths at build time and bundles them as hashed URLs. Works in production (Vercel) without any server.

**Q: How are titles and tags assigned to images?**

> A **seeded pseudo-random number generator (PRNG)** using the image filename as seed. The same filename always gets the same title, category, difficulty, and dot count — so the gallery looks curated but is fully generated, with no database needed.

**Q: What is the pagination system?**

> Simple `visibleCount` state — starts at 24, increments by 24 on "Load More". No router pagination or infinite scroll library needed.

---

## STATE MANAGEMENT

**Q: Is there a global state manager like Redux?**

> No Redux. The app uses:
>
> - **React local state** (`useState`) for component-level state
> - **React Context** (`useContext`) for global state — only `ThemeContext` currently
> - **`useRef`** for mutable values that don't need re-renders (canvas drawing refs)
> - **TanStack Query v5** is installed for future server data fetching (auth, user data)

---

## FORMS & VALIDATION

**Q: What handles forms?**

> **React Hook Form 7.61** with **Zod 3.25** for schema validation. The Login page form uses this. Zod defines the shape (`z.string().email()`) and React Hook Form connects it to inputs without uncontrolled re-renders.

---

## NOTIFICATIONS

**Q: How are toast notifications shown?**

> **Sonner 1.7** — a lightweight toast notification library. Used for "Copied!", download confirmations, and error alerts. Renders in a portal at the top of the DOM.

---

## PDF EXPORT

**Q: How does PDF export work in the canvas?**

> **jsPDF 4.2** combined with **html2canvas 1.4** — html2canvas converts the canvas DOM to an image, jsPDF embeds it into a PDF document and triggers download.

---

## TESTING

**Q: Is there a testing setup?**

> **Vitest 3.2** (test runner, compatible with Vite) + **@testing-library/react 16** for component testing. Run with `npm run test`. Currently has a basic example test in `src/test/`.

---

## DEPLOYMENT

**Q: Where is it deployed?**

> **Vercel** — connected to the GitHub repo (`mritunjai-prog/KolamCraft`). Every push to `main` triggers an automatic build and deploy. No server configuration needed.

**Q: What does the build output look like?**

> Vite bundles into `dist/` — HTML, chunked JS, hashed CSS. All 600+ images are bundled as hashed asset URLs. Total size ~15–20MB (mostly images).

**Q: Is there a backend?**

> Currently **no backend**. It's a fully static SPA. All logic runs in the browser. For future Google Authentication, **Supabase** (Backend-as-a-Service) is planned — it provides OAuth, user database, and a JS SDK without writing any server code.

---

## VERSION CONTROL

**Q: How is the code managed?**

> **Git** + **GitHub** (`github.com/mritunjai-prog/KolamCraft`). Conventional commit messages (`feat:`, `fix:`, `chore:`). Single `main` branch with direct pushes, auto-deployed to Vercel on every push.

---

## SUMMARY TABLE

| Category          | Technology                             | Version |
| ----------------- | -------------------------------------- | ------- |
| UI Framework      | React                                  | 18.3.1  |
| Language          | TypeScript                             | 5.8.3   |
| Build Tool        | Vite + SWC                             | 5.4.19  |
| Styling           | Tailwind CSS                           | 3.4.17  |
| Animations        | Framer Motion                          | 11.18.2 |
| UI Primitives     | Radix UI                               | various |
| Component Library | shadcn/ui                              | bundled |
| Icons             | Lucide React                           | 0.462.0 |
| Routing           | React Router                           | 6.30.1  |
| Forms             | React Hook Form                        | 7.61.1  |
| Validation        | Zod                                    | 3.25.76 |
| Toasts            | Sonner                                 | 1.7.4   |
| Canvas Raster     | html2canvas                            | 1.4.1   |
| PDF Export        | jsPDF                                  | 4.2.0   |
| Testing           | Vitest                                 | 3.2.4   |
| ID Generation     | nanoid                                 | 5.1.6   |
| Fonts             | Google Fonts (Playfair Display, Inter) | —       |
| Deployment        | Vercel                                 | —       |
| Repo              | GitHub                                 | —       |
