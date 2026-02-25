// Core kolam data structures and types for traditional South Indian geometric patterns

export interface Point {
  x: number;
  y: number;
}

export interface CurvePoint {
  x: number;
  y: number;
  controlX?: number;
  controlY?: number;
}

export interface KolamCurvePattern {
  id: number;
  points: CurvePoint[];
  hasDownConnection: boolean;
  hasRightConnection: boolean;
}

export interface GridCell {
  row: number;
  col: number;
  patternId: number;
  dotCenter: Point;
}

export interface KolamGrid {
  size: number;
  cells: GridCell[][];
  cellSpacing: number;
}

export interface Line {
  id: string;
  start: Point;
  end: Point;
  strokeWidth?: number;
  color?: string;
  curvePoints?: CurvePoint[];
}

export interface Dot {
  id: string;
  center: Point;
  radius?: number;
  color?: string;
  filled?: boolean;
}

export interface KolamPattern {
  id: string;
  name: string;
  grid: KolamGrid;
  curves: Line[];
  dots: Dot[];
  symmetryType: "1D" | "2D" | "none";
  dimensions: {
    width: number;
    height: number;
  };
  created: Date;
  modified: Date;
}

export interface AnimationStep {
  elementId: string;
  elementType: "dot" | "curve";
  delay: number;
  duration: number;
  drawOrder: number;
}

export interface KolamAnimation {
  id: string;
  patternId: string;
  steps: AnimationStep[];
  totalDuration: number;
  loop: boolean;
}

export type KolamExportFormat = "svg" | "png" | "gif" | "json";

export interface ExportOptions {
  format: KolamExportFormat;
  includeAnimation?: boolean;
  backgroundColor?: string;
  scale?: number;
  frameCount?: number;
  delay?: number;
}

export interface ConnectivityRules {
  downConnectors: Set<number>;
  rightConnectors: Set<number>;
  compatiblePatterns: { [key: number]: number[] };
}
