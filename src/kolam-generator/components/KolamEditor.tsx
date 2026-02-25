import React, { useCallback, useEffect, useRef, useState } from "react";
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
    } catch (error) {
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
      alert("Raw SVG code copied to clipboard!");
    } catch {
      alert("Failed to copy raw SVG.");
    }
  };

  const AMBER_DARK = "#78350f"; // amber-900
  const AMBER_MED = "#b45309"; // amber-700
  const AMBER_PALE = "#fef3c7"; // amber-100
  const AMBER_200 = "#fde68a"; // amber-200
  const AMBER_300 = "#fcd34d"; // amber-300

  return (
    <div
      className="kolam-editor min-h-screen"
      style={{ backgroundColor: AMBER_PALE, color: AMBER_DARK }}
    >
      <div className="max-w-6xl mx-auto p-8">
        {/* Display Area */}
        <div className="kolam-display-area">
          {currentPattern ? (
            <div
              ref={kolamRef}
              className="kolam-container relative flex justify-center items-center p-8 rounded-2xl shadow-lg"
              style={{
                backgroundColor: AMBER_DARK,
                border: "4px solid white",
              }}
            >
              <KolamDisplay
                pattern={currentPattern}
                animate={animationState === "playing"}
                animationState={animationState}
                animationTiming={animationDuration}
                className="kolam-main"
              />

              {/* Download button */}
              <div className="absolute top-4 right-4">
                <div className="relative download-menu">
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    disabled={isExporting}
                    className="p-3 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 shadow-lg"
                    style={{
                      border: "2px solid white",
                      backgroundColor: "#f0c75e",
                      color: "#92400e",
                    }}
                    title="Download Options"
                  >
                    {isExporting ? "⏳" : "💾"}
                  </button>

                  {showDownloadMenu && (
                    <div
                      className="absolute right-0 mt-2 rounded-lg shadow-lg py-1 z-10"
                      style={{
                        backgroundColor: AMBER_DARK,
                        border: "2px solid white",
                        minWidth: "200px",
                      }}
                    >
                      <button
                        onClick={() => {
                          exportPattern("svg");
                          setShowDownloadMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:opacity-80 transition-opacity"
                        style={{ color: AMBER_PALE }}
                      >
                        📄 Download SVG
                      </button>
                      <button
                        onClick={() => {
                          exportPattern("png");
                          setShowDownloadMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:opacity-80 transition-opacity"
                        style={{ color: AMBER_PALE }}
                      >
                        🖼️ Download PNG
                      </button>
                      <hr
                        style={{
                          margin: "4px 0",
                          borderColor: "rgba(255,255,255,0.3)",
                        }}
                      />
                      <button
                        onClick={() => {
                          copyRawSVG();
                          setShowDownloadMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:opacity-80 transition-opacity"
                        style={{ color: AMBER_PALE }}
                      >
                        📄 Copy Raw SVG
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="no-pattern text-center py-12 rounded-2xl"
              style={{ backgroundColor: AMBER_DARK, border: "2px solid white" }}
            >
              <p className="text-lg" style={{ color: AMBER_PALE }}>
                Loading your first kolam...
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          className="rounded-2xl p-6 mt-8"
          style={{ backgroundColor: AMBER_DARK, border: "4px solid white" }}
        >
          <h2
            className="text-xl font-semibold mb-4 flex items-center"
            style={{ color: AMBER_PALE }}
          >
            <span className="mr-2">⚙️</span>
            Kolam Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Grid Size */}
            <div className="parameter-group">
              <label
                htmlFor="size"
                className="block text-sm font-medium mb-2"
                style={{ color: AMBER_PALE }}
              >
                Grid Size
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="size"
                  type="range"
                  min="3"
                  max="15"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="flex-1"
                  style={{ accentColor: "#f0c75e" }}
                />
                <div
                  className="px-3 py-1 rounded min-w-[3rem] text-center font-bold"
                  style={{ backgroundColor: AMBER_MED, color: AMBER_PALE }}
                >
                  {size}
                </div>
              </div>
              <div className="text-xs mt-1" style={{ color: AMBER_200 }}>
                Creates a {size}×{size} pattern grid
              </div>
            </div>

            {/* Animation Speed */}
            <div className="parameter-group">
              <label
                htmlFor="animationSpeed"
                className="block text-sm font-medium mb-2"
                style={{ color: AMBER_PALE }}
              >
                Animation Duration
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="animationSpeed"
                  type="range"
                  min="1"
                  max="10"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                  className="flex-1"
                  style={{ accentColor: "#f0c75e" }}
                />
                <div
                  className="px-3 py-1 rounded min-w-[3rem] text-center font-bold"
                  style={{ backgroundColor: AMBER_MED, color: AMBER_PALE }}
                >
                  {animationSpeed}
                </div>
              </div>
              <div className="text-xs mt-1" style={{ color: AMBER_200 }}>
                Total: {(animationDuration / 1000).toFixed(1)}s
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            {currentPattern && (
              <button
                onClick={() =>
                  setAnimationState((prev) =>
                    prev === "playing" ? "stopped" : "playing",
                  )
                }
                className="px-6 py-3 rounded-lg hover:opacity-90 transition-colors font-medium shadow-lg flex items-center gap-2"
                style={{
                  border: "2px solid white",
                  backgroundColor:
                    animationState === "playing" ? "#f0c75e" : "#7b3306",
                  color: animationState === "playing" ? "#92400e" : "white",
                }}
                title={animationState === "playing" ? "Stop (P)" : "Play (P)"}
              >
                {animationState === "playing"
                  ? "⏹️ Stop Animation"
                  : "▶️ Play Animation"}
              </button>
            )}

            <button
              onClick={() => generatePattern()}
              className="px-8 py-3 rounded-lg hover:opacity-90 transition-colors font-medium shadow-lg"
              style={{
                border: "2px solid white",
                backgroundColor: "#5ba293",
                color: "white",
              }}
              title="Generate new Kolam (G)"
            >
              ✨ Generate Kolam
            </button>
          </div>

          <p className="text-center text-xs mt-4" style={{ color: AMBER_300 }}>
            Keyboard shortcuts:{" "}
            <kbd
              className="px-1 rounded"
              style={{ backgroundColor: AMBER_MED, color: AMBER_PALE }}
            >
              G
            </kbd>{" "}
            Generate &nbsp;
            <kbd
              className="px-1 rounded"
              style={{ backgroundColor: AMBER_MED, color: AMBER_PALE }}
            >
              P
            </kbd>{" "}
            Play/Stop &nbsp;
            <kbd
              className="px-1 rounded"
              style={{ backgroundColor: AMBER_MED, color: AMBER_PALE }}
            >
              Esc
            </kbd>{" "}
            Reset
          </p>
        </div>
      </div>
    </div>
  );
};
