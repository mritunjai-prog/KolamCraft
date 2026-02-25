import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Play,
  Square,
  Sparkles,
  Copy,
  FileCode2,
  ImageDown,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { KolamPattern } from "../types/kolam";
import { KolamExporter } from "../utils/kolamExporter";
import { KolamGenerator } from "../utils/kolamGenerator";
import { KolamDisplay } from "./KolamDisplay";

// Speed/duration helpers
export const speedToDuration = (speed: number): number => {
  const minMs = 7500;
  const maxMs = 15000;
  const normalized = (speed - 1) / 9;
  const inverted = 1 - normalized;
  return Math.round(minMs + (maxMs - minMs) * inverted);
};

export const durationToSpeed = (duration: number): number => {
  const minMs = 7500;
  const maxMs = 15000;
  const inverted = (duration - minMs) / (maxMs - minMs);
  const normalized = 1 - inverted;
  return Math.round(1 + normalized * 9);
};

export const KolamEditor: React.FC = () => {
  const [currentPattern, setCurrentPattern] = useState<KolamPattern | null>(
    null,
  );
  const [isExporting, setIsExporting] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [animationState, setAnimationState] = useState<
    "stopped" | "playing" | "paused"
  >("stopped");
  const [copied, setCopied] = useState(false);
  const kolamRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState(7);
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [animationDuration, setAnimationDuration] = useState(
    speedToDuration(5),
  );

  useEffect(() => {
    setAnimationDuration(speedToDuration(animationSpeed));
  }, [animationSpeed]);

  // Close download menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDownloadMenu &&
        !(event.target as Element).closest(".download-menu")
      ) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDownloadMenu]);

  // Reset animation state when it finishes
  useEffect(() => {
    if (animationState === "playing" && currentPattern) {
      const timer = setTimeout(
        () => setAnimationState("stopped"),
        animationDuration,
      );
      return () => clearTimeout(timer);
    }
  }, [animationState, currentPattern, animationDuration]);

  const generatePattern = useCallback(() => {
    try {
      const pattern = KolamGenerator.generateKolam1D(size);
      setCurrentPattern(pattern);
      setAnimationState("stopped");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Error generating pattern: ${msg}`);
    }
  }, [size]);

  // Generate on mount
  useEffect(() => {
    generatePattern();
  }, [generatePattern]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        (event.target.tagName === "INPUT" || event.target.tagName === "SELECT")
      )
        return;
      switch (event.key.toLowerCase()) {
        case " ":
        case "p":
          event.preventDefault();
          setAnimationState((prev) =>
            prev === "playing" ? "stopped" : "playing",
          );
          break;
        case "g":
          event.preventDefault();
          generatePattern();
          break;
        case "escape":
          event.preventDefault();
          setAnimationState("stopped");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [generatePattern]);

  const exportPattern = async (format: "svg" | "png") => {
    if (!currentPattern || !kolamRef.current) return;
    setIsExporting(true);
    try {
      if (format === "svg") {
        await KolamExporter.downloadSVG(currentPattern);
      } else {
        await KolamExporter.downloadPNG(kolamRef.current, currentPattern.name);
      }
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const copyRawSVG = async () => {
    if (!currentPattern) return;
    try {
      const svgContent = await KolamExporter.exportAsSVG(currentPattern);
      await navigator.clipboard.writeText(svgContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy raw SVG.");
    }
  };

  return (
    <div className="kolam-editor w-full">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
        {/* ── Canvas Display ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="glass-strong rounded-3xl border border-primary/20 overflow-hidden shadow-2xl relative">
            {/* subtle ambient glow behind canvas */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-primary/10 blur-3xl" />
            </div>

            {/* canvas content */}
            <div
              ref={kolamRef}
              className="relative flex justify-center items-center p-8 md:p-12 min-h-[420px]"
            >
              <AnimatePresence mode="wait">
                {currentPattern ? (
                  <motion.div
                    key={currentPattern.name}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="w-full"
                  >
                    <KolamDisplay
                      pattern={currentPattern}
                      animate={animationState === "playing"}
                      animationState={animationState}
                      animationTiming={animationDuration}
                      className="kolam-main w-full"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-3 text-muted-foreground"
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm">Weaving your first kolam…</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Download button — top right overlay */}
            <div className="absolute top-4 right-4 download-menu z-10">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-primary/30 text-primary hover:bg-primary/20 transition-all disabled:opacity-50 text-sm font-medium shadow-lg"
                title="Download Options"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {showDownloadMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 glass-strong rounded-2xl border border-border shadow-2xl py-2 min-w-[200px]"
                  >
                    <button
                      onClick={() => {
                        exportPattern("svg");
                        setShowDownloadMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <FileCode2 className="w-4 h-4 text-primary" />
                      Download SVG
                    </button>
                    <button
                      onClick={() => {
                        exportPattern("png");
                        setShowDownloadMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <ImageDown className="w-4 h-4 text-primary" />
                      Download PNG
                    </button>
                    <div className="mx-3 my-1 h-px bg-border" />
                    <button
                      onClick={() => {
                        copyRawSVG();
                        setShowDownloadMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <Copy className="w-4 h-4 text-primary" />
                      {copied ? "Copied!" : "Copy Raw SVG"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pattern name badge — bottom left */}
            {currentPattern && (
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium glass border border-primary/20 text-primary/80">
                  {currentPattern.name}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Controls Panel ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="flex flex-col gap-5"
        >
          {/* Parameters card */}
          <div className="glass rounded-3xl border border-border p-6 shadow-xl">
            <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-primary" />
              </span>
              Parameters
            </h2>

            <div className="space-y-6">
              {/* Grid Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="size"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Grid Size
                  </label>
                  <span className="px-2.5 py-0.5 rounded-lg bg-primary/20 text-primary text-sm font-bold tabular-nums">
                    {size}
                  </span>
                </div>
                <input
                  id="size"
                  type="range"
                  min="3"
                  max="15"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-primary/20 accent-[hsl(var(--primary))]"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Creates a {size}×{size} dot grid
                </p>
              </div>

              {/* Animation Speed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="animationSpeed"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Animation Speed
                  </label>
                  <span className="px-2.5 py-0.5 rounded-lg bg-primary/20 text-primary text-sm font-bold tabular-nums">
                    {animationSpeed}
                  </span>
                </div>
                <input
                  id="animationSpeed"
                  type="range"
                  min="1"
                  max="10"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-primary/20 accent-[hsl(var(--primary))]"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Draw time: {(animationDuration / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
          </div>

          {/* Actions card */}
          <div className="glass rounded-3xl border border-border p-6 shadow-xl flex flex-col gap-3">
            <h2 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-primary" />
              </span>
              Actions
            </h2>

            {/* Generate */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => generatePattern()}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm box-glow hover:brightness-110 transition-all shadow-lg"
              title="Generate new Kolam (G)"
            >
              <Sparkles className="w-4 h-4" />
              Generate Kolam
            </motion.button>

            {/* Play / Stop */}
            {currentPattern && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  setAnimationState((prev) =>
                    prev === "playing" ? "stopped" : "playing",
                  )
                }
                className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all border ${
                  animationState === "playing"
                    ? "bg-primary/15 border-primary/40 text-primary hover:bg-primary/25"
                    : "bg-card border-border text-foreground hover:bg-primary/10 hover:border-primary/30"
                }`}
                title={
                  animationState === "playing"
                    ? "Stop (P)"
                    : "Play animation (P)"
                }
              >
                {animationState === "playing" ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop Animation
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play Animation
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* Keyboard shortcuts card */}
          <div className="glass rounded-3xl border border-border p-5 shadow-xl">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Keyboard Shortcuts
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { key: "G", desc: "Generate" },
                { key: "P", desc: "Play / Stop" },
                { key: "Esc", desc: "Reset" },
              ].map(({ key, desc }) => (
                <div key={key} className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold">
                    {key}
                  </kbd>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
