import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Pen,
  Grid3X3,
  RotateCcw,
  Download,
  Palette,
  Layers,
  ArrowRight,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";

// Rangoli SVG paths — symmetric petal/star design centred on 400,250
const RANGOLI_PATHS = [
  // Inner ring
  "M 400 200 Q 450 225 450 250 Q 450 275 400 300 Q 350 275 350 250 Q 350 225 400 200",
  // 8 outer petals
  "M 400 250 Q 370 160 340 100 Q 400 75 460 100 Q 430 160 400 250",
  "M 400 250 Q 490 220 550 190 Q 575 250 550 310 Q 490 280 400 250",
  "M 400 250 Q 430 340 460 400 Q 400 425 340 400 Q 370 340 400 250",
  "M 400 250 Q 310 280 250 310 Q 225 250 250 190 Q 310 220 400 250",
  "M 400 250 Q 445 175 480 120 Q 540 155 555 215 Q 490 225 400 250",
  "M 400 250 Q 475 295 530 330 Q 515 390 460 400 Q 440 340 400 250",
  "M 400 250 Q 355 325 320 380 Q 260 365 245 310 Q 310 275 400 250",
  "M 400 250 Q 325 205 270 170 Q 265 110 320 100 Q 360 155 400 250",
  // Outer ring
  "M 340 100 Q 400 58 460 100",
  "M 460 100 Q 540 155 555 215",
  "M 555 215 Q 575 250 550 310",
  "M 550 310 Q 515 390 460 400",
  "M 460 400 Q 400 442 340 400",
  "M 340 400 Q 260 365 245 310",
  "M 245 310 Q 225 250 250 190",
  "M 250 190 Q 265 110 320 100",
  // Centre star / mandala
  "M 400 222 L 413 242 L 428 222 L 420 245 L 428 268 L 413 258 L 400 278 L 387 258 L 372 268 L 380 245 L 372 222 L 387 242 Z",
];

// Ordered animation delays by group
const DELAYS: number[] = new Array(RANGOLI_PATHS.length).fill(0);
[
  [0],
  [1, 3, 5, 7],
  [2, 4, 6, 8],
  [9, 10, 11, 12, 13, 14, 15, 16],
  [17],
].forEach((group, gi) => {
  group.forEach((i) => {
    DELAYS[i] = 1.0 + gi * 0.55;
  });
});

const tools = [
  {
    icon: Pen,
    label: "Draw & Curve",
    desc: "Line, freehand, curve & shape tools",
  },
  {
    icon: Grid3X3,
    label: "Grid Types",
    desc: "Dots, triangular & circular grids",
  },
  { icon: Layers, label: "Symmetry", desc: "Mirror & 8-fold radial symmetry" },
  { icon: Palette, label: "Colors", desc: "Full color picker & brush size" },
  { icon: RotateCcw, label: "Undo/Redo", desc: "Full stroke history" },
  { icon: Download, label: "Export", desc: "PNG, PDF & print" },
];

const CanvasPreview = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="canvas" ref={ref} className="relative py-32 px-6">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/4 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-4">
            Interactive Studio
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold gradient-text mb-6">
            Your Digital Canvas
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A full-featured drawing studio — draw rangoli with symmetry tools,
            multiple grid types, and one-click export.
          </p>
        </motion.div>

        {/* Canvas mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Clickable preview opens canvas */}
          <Link to="/canvas" className="group block">
            <div className="glass-strong rounded-3xl p-1 box-glow-lg transition-all duration-300 group-hover:shadow-[0_0_60px_hsl(225_75%_60%/0.3)]">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border/50">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <div className="w-3 h-3 rounded-full bg-green-500/40" />
                <span className="ml-3 text-xs text-muted-foreground">
                  KolamCraft — Canvas Studio
                </span>
                <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary font-medium">
                  <Sparkles className="w-3 h-3" /> Open Canvas
                </div>
              </div>

              {/* Canvas area with animated rangoli */}
              <div className="relative aspect-[16/10] rounded-b-3xl overflow-hidden bg-[#05081a]">
                {/* Grid dots */}
                <svg className="absolute inset-0 w-full h-full" aria-hidden>
                  {Array.from({ length: 10 }).map((_, row) =>
                    Array.from({ length: 14 }).map((_, col) => (
                      <motion.circle
                        key={`${row}-${col}`}
                        cx={`${(col + 1) * 6.5}%`}
                        cy={`${(row + 1) * 9}%`}
                        r={1.8}
                        fill="hsl(43 74% 49%)"
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 0.3 } : {}}
                        transition={{
                          delay: 0.4 + (row * 14 + col) * 0.004,
                          duration: 0.4,
                        }}
                      />
                    )),
                  )}
                </svg>

                {/* Animated Rangoli draw-in */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 800 500"
                >
                  <motion.circle
                    cx={400}
                    cy={250}
                    r={115}
                    fill="hsl(43 74% 49% / 0.06)"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.9, duration: 1.5 }}
                  />
                  {RANGOLI_PATHS.map((d, i) => (
                    <motion.path
                      key={i}
                      d={d}
                      stroke={i === 17 ? "hsl(43 74% 62%)" : "hsl(225 75% 65%)"}
                      strokeWidth={i === 17 ? 1.5 : 2}
                      fill={i === 17 ? "hsl(43 74% 49% / 0.12)" : "none"}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                      transition={{
                        pathLength: {
                          duration: 1.1,
                          delay: DELAYS[i],
                          ease: "easeInOut",
                        },
                        opacity: { duration: 0.25, delay: DELAYS[i] },
                      }}
                    />
                  ))}
                </svg>

                {/* Hover open-canvas overlay */}
                <div className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 shadow-xl">
                    <Wand2 className="w-4 h-4" /> Start Drawing Now
                  </div>
                </div>

                {/* Live badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 3.8 }}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-medium flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Live Canvas
                </motion.div>
              </div>
            </div>
          </Link>

          {/* Tool cards — each links to /canvas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1, duration: 0.6 }}
            className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-8"
          >
            {tools.map((tool, i) => (
              <Link to="/canvas" key={tool.label} tabIndex={-1}>
                <motion.div
                  key={tool.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  whileHover={{ scale: 1.08, y: -5 }}
                  title={tool.desc}
                  className="flex flex-col items-center gap-2 px-3 py-3 rounded-xl glass cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                >
                  <tool.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                    {tool.label}
                  </span>
                </motion.div>
              </Link>
            ))}
          </motion.div>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 2.2 }}
            className="flex justify-center mt-8 gap-4 flex-wrap"
          >
            <Link to="/canvas">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-7 py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 box-glow"
              >
                Open Drawing Canvas <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link to="/generator">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-7 py-3 rounded-xl border border-border text-foreground font-medium flex items-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-primary" /> Try Auto Generator
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CanvasPreview;
