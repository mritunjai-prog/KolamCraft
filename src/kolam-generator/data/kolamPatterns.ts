import { KolamCurvePattern } from "../types/kolam";
import kolamData from "./kolamPatternsData.json";

export const KOLAM_CURVE_PATTERNS: KolamCurvePattern[] = (
  kolamData as any
).patterns.map((pattern: any) => ({
  id: pattern.id,
  points: pattern.points,
  hasDownConnection: pattern.hasDownConnection,
  hasRightConnection: pattern.hasRightConnection,
}));

export const CONNECTIVITY_RULES = {
  downConnectors: new Set(
    KOLAM_CURVE_PATTERNS.filter((p) => p.hasDownConnection).map((p) => p.id),
  ),
  rightConnectors: new Set(
    KOLAM_CURVE_PATTERNS.filter((p) => p.hasRightConnection).map((p) => p.id),
  ),
  compatiblePatterns: generateCompatibilityMatrix(),
};

function generateCompatibilityMatrix(): { [key: number]: number[] } {
  const matrix: { [key: number]: number[] } = {};
  for (let i = 1; i <= 16; i++) {
    const currentPattern = KOLAM_CURVE_PATTERNS.find((p) => p.id === i);
    if (!currentPattern) continue;
    const compatible: number[] = [];
    for (let j = 1; j <= 16; j++) {
      const targetPattern = KOLAM_CURVE_PATTERNS.find((p) => p.id === j);
      if (!targetPattern) continue;
      if (i === j) continue;
      if (
        currentPattern.hasRightConnection ||
        currentPattern.hasDownConnection
      ) {
        if (
          targetPattern.hasRightConnection ||
          targetPattern.hasDownConnection ||
          j === 1
        ) {
          compatible.push(j);
        }
      } else {
        compatible.push(j);
      }
    }
    matrix[i] = compatible;
  }
  return matrix;
}

export const SYMMETRY_TRANSFORMS = {
  horizontalInverse: [1, 2, 5, 4, 3, 9, 8, 7, 6, 10, 11, 12, 15, 14, 13, 16],
  verticalInverse: [1, 4, 3, 2, 5, 7, 6, 9, 8, 10, 11, 14, 13, 12, 15, 16],
};
