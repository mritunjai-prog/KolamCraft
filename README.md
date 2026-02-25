<div align="center">

# 🪷 KolamCraft

### *Preserving a 3000-year tradition through algorithmic beauty*

**[Live Demo](https://github.com/mritunjai-prog/KolamCraft)** · **[Report Bug](https://github.com/mritunjai-prog/KolamCraft/issues)** · **[Request Feature](https://github.com/mritunjai-prog/KolamCraft/issues)**

![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-EF008F?style=flat&logo=framer&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

</div>

---

## 🎨 What is KolamCraft?

**KolamCraft** is an open-source digital platform that brings **South Indian Kolam (கோலம்)** art into the modern age. Kolam is a traditional art form practiced for over 3,000 years — geometric patterns drawn with rice flour on the ground, believed to bring prosperity and ward off evil.

KolamCraft preserves this living tradition through:
- Algorithmic generation rooted in the mathematical dot-grid system
- An interactive canvas for freehand digital creation
- A curated gallery of 600+ authentic kolam designs

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **Kolam Generator** | Generate infinite kolam patterns algorithmically from dot-grid mathematics |
| 🖼️ **Explore Gallery** | Browse 600+ authentic kolam designs with search, filter and sort |
| 🖌️ **Canvas Studio** | Draw your own kolam interactively on a digital canvas |
| 🌗 **Light / Dark Mode** | Fully adaptive orange-peach theme, toggled from the nav bar |
| 📥 **Export** | Download creations as SVG or PNG, or copy raw SVG code |
| 🎬 **Draw Animation** | Watch kolam patterns draw themselves stroke-by-stroke |
| 📱 **Responsive** | Seamlessly works on mobile, tablet, and desktop |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS v3 + custom CSS variables |
| Animations | Framer Motion |
| UI Components | shadcn/ui |
| Routing | React Router v6 |
| Font | Playfair Display + Inter (Google Fonts) |
| Pattern Engine | Custom 1D Kolam Algorithm |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/mritunjai-prog/KolamCraft.git

# Navigate into the project
cd KolamCraft

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
KolamCraft/
├── public/
│   ├── favicon.svg          # Custom kolam-pattern tab icon
│   └── robots.txt
├── src/
│   ├── assets/              # 600+ kolam design images
│   ├── components/          # Shared UI components
│   │   ├── HeroSection.tsx
│   │   ├── NavigationBar.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── FestivalsSection.tsx
│   │   └── ...
│   ├── pages/               # Route-level page components
│   │   ├── Index.tsx        # Landing page
│   │   ├── GeneratorPage.tsx
│   │   ├── ExplorePage.tsx
│   │   └── CanvasPage.tsx
│   ├── kolam-generator/     # Core pattern engine
│   │   ├── components/      # KolamEditor, KolamDisplay
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Generator, Exporter, SVG utils
│   ├── contexts/
│   │   └── ThemeContext.tsx  # Light/dark mode provider
│   ├── App.tsx
│   └── index.css            # Design tokens + global styles
├── index.html
└── vite.config.ts
```

---

## 🧮 Kolam Algorithm

The generator uses a **1D cellular automaton-inspired** approach to produce mathematically valid kolam patterns:

1. An `n×n` dot grid is initialised based on the chosen **Grid Size** (3–15)
2. Curves are traced around dot clusters following traditional kolam rules — each dot must be completely enclosed by passing curves
3. The resulting pattern is rendered as a scalable SVG
4. An optional **draw animation** strokes each curve sequentially, mimicking the real drawing process

---

## 🎨 Color System

KolamCraft uses HSL-based CSS variables with full light/dark support:

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| `--primary` | Warm orange `hsl(22 88% 62%)` | Deep orange `hsl(22 82% 48%)` |
| `--background` | Near-black `hsl(20 20% 6%)` | Warm cream `hsl(35 38% 96%)` |
| `--foreground` | Creamy white `hsl(33 20% 90%)` | Deep brown `hsl(20 35% 11%)` |

---

## 🤝 Contributing

Contributions are very welcome! Here are some ways to help:

- 🐛 Report bugs via [GitHub Issues](https://github.com/mritunjai-prog/KolamCraft/issues)
- 💡 Suggest new features or patterns
- 🖼️ Add more kolam designs to the gallery (`src/assets/`)
- 🧮 Improve the generation algorithm
- 🌐 Help with translations or accessibility

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, then commit
git commit -m "feat: describe your change"

# Push and open a Pull Request
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

<div align="center">

Made with ❤️ to preserve India's geometric art traditions

*"A kolam is a blessing drawn at the threshold — may this digital kolam welcome all who visit."*

</div>
