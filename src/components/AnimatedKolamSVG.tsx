import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  size?: number;
  className?: string;
  animate?: boolean;
  delay?: number;
}

// Generates a symmetric Kolam-like SVG pattern procedurally
const AnimatedKolamSVG = ({
  size = 400,
  className = "",
  animate = true,
  delay = 0,
}: Props) => {
  const center = size / 2;
  const [paths, setPaths] = useState<string[]>([]);
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const generatedPaths: string[] = [];
    const generatedDots: { x: number; y: number }[] = [];
    const rings = 5;
    const dotsPerRing = [1, 6, 12, 18, 24];
    const ringRadius = [0, size * 0.08, size * 0.16, size * 0.24, size * 0.34];

    // Generate dots on concentric rings
    for (let r = 0; r < rings; r++) {
      const count = dotsPerRing[r];
      for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        generatedDots.push({
          x: center + ringRadius[r] * Math.cos(angle),
          y: center + ringRadius[r] * Math.sin(angle),
        });
      }
    }

    // Create looping curves connecting dots across rings
    for (let r = 1; r < rings; r++) {
      const innerStart = dotsPerRing.slice(0, r).reduce((a, b) => a + b, 0);
      const outerStart =
        dotsPerRing.slice(0, r + 1).reduce((a, b) => a + b, 0) - dotsPerRing[r];
      const innerCount = dotsPerRing[r];
      const outerCount =
        dotsPerRing[r] < dotsPerRing.length
          ? dotsPerRing[Math.min(r + 1, rings - 1)]
          : dotsPerRing[r];

      for (let i = 0; i < innerCount; i++) {
        const dot1 = generatedDots[innerStart + i];
        const nextRingIdx =
          r < rings - 1
            ? outerStart +
              dotsPerRing[r] +
              Math.floor(
                (i * dotsPerRing[Math.min(r + 1, rings - 1)]) / innerCount,
              )
            : innerStart + ((i + 1) % innerCount);

        if (nextRingIdx < generatedDots.length) {
          const dot2 = generatedDots[nextRingIdx];
          const cpx = center + (dot1.x + dot2.x - 2 * center) * 0.6;
          const cpy = center + (dot1.y + dot2.y - 2 * center) * 0.6;
          generatedPaths.push(
            `M ${dot1.x} ${dot1.y} Q ${cpx} ${cpy} ${dot2.x} ${dot2.y}`,
          );
        }
      }
    }

    // Create petal curves for the outermost ring
    const outerStart =
      dotsPerRing.slice(0, rings).reduce((a, b) => a + b, 0) -
      dotsPerRing[rings - 1];
    for (let i = 0; i < dotsPerRing[rings - 1]; i++) {
      const dot1 = generatedDots[outerStart + i];
      const dot2 =
        generatedDots[outerStart + ((i + 1) % dotsPerRing[rings - 1])];
      const midX = (dot1.x + dot2.x) / 2;
      const midY = (dot1.y + dot2.y) / 2;
      const dx = midX - center;
      const dy = midY - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const cpx = center + (dx / dist) * (dist + size * 0.06);
      const cpy = center + (dy / dist) * (dist + size * 0.06);
      generatedPaths.push(
        `M ${dot1.x} ${dot1.y} Q ${cpx} ${cpy} ${dot2.x} ${dot2.y}`,
      );
    }

    // Symmetric inner loops
    for (let i = 0; i < 6; i++) {
      const angle1 = (2 * Math.PI * i) / 6 - Math.PI / 2;
      const angle2 = (2 * Math.PI * ((i + 1) % 6)) / 6 - Math.PI / 2;
      const r1 = ringRadius[2];
      const r2 = ringRadius[3];
      const x1 = center + r1 * Math.cos(angle1);
      const y1 = center + r1 * Math.sin(angle1);
      const x2 = center + r2 * Math.cos((angle1 + angle2) / 2);
      const y2 = center + r2 * Math.sin((angle1 + angle2) / 2);
      generatedPaths.push(`M ${x1} ${y1} Q ${center} ${center} ${x2} ${y2}`);
    }

    setPaths(generatedPaths);
    setDots(generatedDots);
  }, [size, center]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glow filter */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dotGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Curves */}
      {paths.map((d, i) => (
        <motion.path
          key={`path-${i}`}
          d={d}
          stroke="hsl(40 20% 92%)"
          strokeWidth={1.5}
          strokeLinecap="round"
          filter="url(#glow)"
          initial={
            animate
              ? { pathLength: 0, opacity: 0 }
              : { pathLength: 1, opacity: 0.8 }
          }
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{
            pathLength: {
              duration: 2,
              delay: delay + i * 0.03,
              ease: "easeInOut",
            },
            opacity: { duration: 0.5, delay: delay + i * 0.03 },
          }}
        />
      ))}

      {/* Dots */}
      {dots.map((dot, i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={dot.x}
          cy={dot.y}
          r={size * 0.008}
          fill="hsl(43 74% 49%)"
          filter="url(#dotGlow)"
          initial={
            animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }
          }
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.4,
            delay: delay + 0.5 + i * 0.02,
            ease: "backOut",
          }}
        />
      ))}
    </svg>
  );
};

export default AnimatedKolamSVG;
