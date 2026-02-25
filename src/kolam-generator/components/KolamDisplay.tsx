import { CurvePoint, KolamPattern } from "../types/kolam";
import { generateSVGPath } from "../utils/svgPathGenerator";
import React from "react";

interface KolamDisplayProps {
  pattern: KolamPattern;
  animate?: boolean;
  animationState?: "stopped" | "playing" | "paused";
  animationTiming?: number;
  className?: string;
}

export const KolamDisplay: React.FC<KolamDisplayProps> = ({
  pattern,
  animate = false,
  animationState = "stopped",
  animationTiming = 150,
  className = "",
}) => {
  const { dimensions, dots, curves } = pattern;

  const calculatePathLength = (curvePoints?: CurvePoint[]): number => {
    if (!curvePoints || curvePoints.length < 2) return 100;
    let length = 0;
    for (let i = 1; i < curvePoints.length; i++) {
      const dx = curvePoints[i].x - curvePoints[i - 1].x;
      const dy = curvePoints[i].y - curvePoints[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.max(length, 50);
  };

  return (
    <div className={`kolam-container text-foreground ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="kolam-svg"
        style={
          {
            maxWidth: "100%",
            height: "auto",
            "--animation-duration": `${animationTiming}ms`,
          } as React.CSSProperties
        }
      >
        {dots.map((dot, index) => (
          <circle
            key={dot.id}
            cx={dot.center.x}
            cy={dot.center.y}
            r={dot.radius || 3}
            fill={dot.filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={dot.filled ? 0 : 1}
            className={animate ? "kolam-dot-animated" : "kolam-dot"}
            style={
              animate
                ? {
                    animationDelay: `${(index / dots.length) * animationTiming * 0.9}ms`,
                    animationDuration: `${animationTiming / dots.length}ms`,
                    opacity: 0,
                    animationPlayState:
                      animationState === "paused" ? "paused" : "running",
                  }
                : animationState === "stopped"
                  ? { opacity: 1 }
                  : {}
            }
          />
        ))}

        {curves.map((curve, index) => {
          const lineAnimTime = (animationTiming / curves.length) * 3;
          const curveDelay = (lineAnimTime * index) / 3;

          if (curve.curvePoints && curve.curvePoints.length > 1) {
            const pathLength = calculatePathLength(curve.curvePoints);
            return (
              <path
                key={curve.id}
                d={generateSVGPath(curve.curvePoints)}
                stroke="currentColor"
                strokeWidth={curve.strokeWidth || 2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={animate ? "kolam-curve-animated" : "kolam-curve"}
                style={
                  animate
                    ? {
                        strokeDasharray: pathLength,
                        strokeDashoffset: pathLength,
                        animationDelay: `${curveDelay}ms`,
                        animationDuration: `${lineAnimTime}ms`,
                        animationFillMode: "forwards",
                        animationPlayState:
                          animationState === "paused" ? "paused" : "running",
                      }
                    : animationState === "stopped"
                      ? { strokeDasharray: "none", strokeDashoffset: 0 }
                      : {}
                }
              />
            );
          } else {
            return (
              <line
                key={curve.id}
                x1={curve.start.x}
                y1={curve.start.y}
                x2={curve.end.x}
                y2={curve.end.y}
                stroke="currentColor"
                strokeWidth={curve.strokeWidth || 2}
                strokeLinecap="round"
              />
            );
          }
        })}
      </svg>

      <style>{`
        @keyframes drawCurve {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeInDot {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .kolam-curve-animated {
          animation-name: drawCurve;
          animation-timing-function: ease-in-out;
        }
        .kolam-dot-animated {
          animation-name: fadeInDot;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};
