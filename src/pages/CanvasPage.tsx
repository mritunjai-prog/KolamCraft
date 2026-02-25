import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Grid3x3,
  Circle,
  Triangle,
  Minus,
  Pen,
  Eraser,
  Trash2,
  Download,
  Printer,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Zap,
  PaintBucket,
  Square,
  Diamond,
  Brush,
  Undo2,
  Redo2,
  Feather,
  ArrowLeft,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type GridType = "rectangular" | "triangular" | "circular" | "none";
type Tool = "line" | "curve" | "eraser" | "fill" | "freehand" | "shape";
type ShapeType = "circle" | "diamond" | "triangle" | "square";
type SymmetryMode = "none" | "vertical" | "horizontal" | "radial";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  type: Tool | "shape" | "fill";
  points: Point[];
  color: string;
  width: number;
  symmetryMode: SymmetryMode;
  shapeType?: ShapeType;
  shapeDimensions?: { radius: number };
}

const CanvasPage: React.FC = () => {
  const location = useLocation();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("line");
  const [shapeType, setShapeType] = useState<ShapeType>("circle");
  const [gridType, setGridType] = useState<GridType>("rectangular");
  const [dots, setDots] = useState<Point[]>([]);
  const [gridSize, setGridSize] = useState({ rows: 15, cols: 15 });
  const [spacing, setSpacing] = useState(30);
  const [symmetryMode, setSymmetryMode] = useState<SymmetryMode>("none");
  const [brushColor, setBrushColor] = useState("#4169e1");
  const [brushWidth, setBrushWidth] = useState(3);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [history, setHistory] = useState<Stroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null,
  );
  const [shapeStartPoint, setShapeStartPoint] = useState<Point | null>(null);
  const [previewStroke, setPreviewStroke] = useState<Stroke | null>(null);

  // Refs for synchronous access inside event handlers (avoids React stale closure bugs)
  const currentPathRef = useRef<Point[]>([]);
  const shapeStartRef = useRef<Point | null>(null);
  const isDrawingRef = useRef(false);

  const canvasWidth = 800;
  const canvasHeight = 600;

  const generateDots = useCallback(() => {
    const newDots: Point[] = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const startX = centerX - ((gridSize.cols - 1) * spacing) / 2;
    const startY = centerY - ((gridSize.rows - 1) * spacing) / 2;

    switch (gridType) {
      case "rectangular":
        for (let row = 0; row < gridSize.rows; row++) {
          for (let col = 0; col < gridSize.cols; col++) {
            newDots.push({
              x: startX + col * spacing,
              y: startY + row * spacing,
            });
          }
        }
        break;
      case "triangular":
        for (let row = 0; row < gridSize.rows; row++) {
          const colsInRow = gridSize.cols - Math.floor(row / 2);
          const rowOffset = ((row % 2) * spacing) / 2;
          for (let col = 0; col < colsInRow; col++) {
            newDots.push({
              x: startX + col * spacing + rowOffset,
              y: startY + row * spacing * 0.866,
            });
          }
        }
        break;
      case "circular":
        const rings = Math.min(gridSize.rows, gridSize.cols);
        for (let ring = 0; ring <= rings; ring++) {
          if (ring === 0) newDots.push({ x: centerX, y: centerY });
          else {
            const radius = ring * spacing;
            const pointsInRing = ring * 8;
            for (let i = 0; i < pointsInRing; i++) {
              const angle = (i / pointsInRing) * 2 * Math.PI;
              newDots.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
              });
            }
          }
        }
        break;
      case "none":
        break;
    }
    setDots(newDots);
  }, [gridType, gridSize, spacing, canvasWidth, canvasHeight]);

  const drawDots = useCallback(() => {
    const dotCanvas = dotCanvasRef.current;
    if (!dotCanvas) return;
    const ctx = dotCanvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (gridType === "none") return;
    ctx.fillStyle = "#DAA520";
    dots.forEach((dot) => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [dots, gridType, canvasWidth, canvasHeight]);

  const findNearestDot = (point: Point): Point => {
    if (gridType === "none") return point;
    let nearest = point;
    let minDist = 20;
    dots.forEach((dot) => {
      const dist = Math.hypot(dot.x - point.x, dot.y - point.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = dot;
      }
    });
    return nearest;
  };

  const applySymmetry = (point: Point): Point[] => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const points: Point[] = [point];
    switch (symmetryMode) {
      case "vertical":
        points.push({ x: canvasWidth - point.x, y: point.y });
        break;
      case "horizontal":
        points.push({ x: point.x, y: canvasHeight - point.y });
        break;
      case "radial":
        for (let i = 1; i < 8; i++) {
          const angle = (i / 4) * Math.PI;
          const cos = Math.cos(angle),
            sin = Math.sin(angle);
          const dx = point.x - centerX,
            dy = point.y - centerY;
          points.push({
            x: centerX + dx * cos - dy * sin,
            y: centerY + dx * sin + dy * cos,
          });
        }
        break;
    }
    return points;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;
    const startPixel = (startY * canvasWidth + startX) * 4;
    const targetColor = {
      r: data[startPixel],
      g: data[startPixel + 1],
      b: data[startPixel + 2],
      a: data[startPixel + 3],
    };
    const fillRGB = hexToRgb(fillColor);
    if (
      !fillRGB ||
      (fillRGB.r === targetColor.r &&
        fillRGB.g === targetColor.g &&
        fillRGB.b === targetColor.b)
    )
      return;
    const pixelStack: Point[] = [{ x: startX, y: startY }];
    while (pixelStack.length) {
      const { x, y } = pixelStack.pop()!;
      if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) continue;
      const idx = (y * canvasWidth + x) * 4;
      if (
        data[idx] === targetColor.r &&
        data[idx + 1] === targetColor.g &&
        data[idx + 2] === targetColor.b &&
        data[idx + 3] === targetColor.a
      ) {
        data[idx] = fillRGB.r;
        data[idx + 1] = fillRGB.g;
        data[idx + 2] = fillRGB.b;
        data[idx + 3] = 255;
        pixelStack.push(
          { x: x + 1, y },
          { x: x - 1, y },
          { x, y: y + 1 },
          { x, y: y - 1 },
        );
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Map CSS pixels → canvas coordinate space (handles any CSS scaling)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    if (tool === "fill") {
      setStrokes((prev) => [
        ...prev,
        {
          type: "fill",
          points: [point],
          color: brushColor,
          width: 0,
          symmetryMode: "none",
        },
      ]);
      return;
    }
    isDrawingRef.current = true;
    setIsDrawing(true);
    if (tool === "freehand" || tool === "curve") {
      currentPathRef.current = [point];
      return;
    }
    if (tool === "line") {
      currentPathRef.current = [findNearestDot(point)];
      return;
    }
    if (tool === "shape") {
      // Use exact cursor position (not snapped) so shape appears under cursor
      shapeStartRef.current = point;
      setShapeStartPoint(point);
      setPreviewStroke(null);
      return;
    }
  };

  // Draw everything to canvas immediately using ref data — no React state cycle needed
  const drawImmediate = (extraStroke?: Stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Draw all committed strokes (plus any shape preview passed in)
    const all = extraStroke ? [...strokes, extraStroke] : strokes;
    all.forEach((s) => drawStrokeOnCtx(ctx, s));
    // Draw the in-progress stroke from the ref
    const path = currentPathRef.current;
    if (path.length < 2) return;
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    const symCount = applySymmetry(path[0]).length;
    const getSymPts = (p: Point) => applySymmetry(p);
    if (tool === "line") {
      const s0 = getSymPts(path[0]);
      const s1 = getSymPts(path[1]);
      for (let si = 0; si < symCount; si++) {
        ctx.beginPath();
        ctx.moveTo(s0[si % s0.length].x, s0[si % s0.length].y);
        ctx.lineTo(s1[si % s1.length].x, s1[si % s1.length].y);
        ctx.stroke();
      }
    } else if (tool === "freehand") {
      // Raw line segments — fast, pencil-like
      for (let si = 0; si < symCount; si++) {
        ctx.beginPath();
        path.forEach((pt, idx) => {
          const sp = getSymPts(pt);
          const p = sp[si % sp.length];
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    } else if (tool === "curve") {
      // Smooth quadratic Bézier — flowing, curved lines
      for (let si = 0; si < symCount; si++) {
        const pts = path.map((p) => {
          const sp = getSymPts(p);
          return sp[si % sp.length];
        });
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        if (pts.length === 2) {
          ctx.lineTo(pts[1].x, pts[1].y);
        } else {
          for (let i = 1; i < pts.length - 1; i++) {
            const midX = (pts[i].x + pts[i + 1].x) / 2;
            const midY = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
          }
          ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        }
        ctx.stroke();
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const point = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(point.x, point.y, brushWidth * 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      return;
    }

    if (tool === "freehand" || tool === "curve") {
      currentPathRef.current = [...currentPathRef.current, point];
    } else if (tool === "line") {
      if (currentPathRef.current.length >= 1) {
        // Always use ref[0] — never stale unlike state
        currentPathRef.current = [
          currentPathRef.current[0],
          findNearestDot(point),
        ];
      }
    } else if (tool === "shape" && shapeStartRef.current) {
      const radius = Math.hypot(
        point.x - shapeStartRef.current.x,
        point.y - shapeStartRef.current.y,
      );
      const shapeStroke: Stroke = {
        type: "shape",
        points: [shapeStartRef.current],
        color: brushColor,
        width: brushWidth,
        symmetryMode,
        shapeType,
        shapeDimensions: { radius },
      };
      setPreviewStroke(shapeStroke);
      // Draw immediately with the shape — don't wait for state update
      drawImmediate(shapeStroke);
      return;
    }

    drawImmediate();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    setIsDrawing(false);
    if (tool === "eraser" || tool === "fill") {
      currentPathRef.current = [];
      return;
    }
    if (tool === "shape" && shapeStartRef.current && previewStroke) {
      const newStrokes = [...strokes, previewStroke];
      const newHistory = history.slice(0, historyIndex + 1);
      setStrokes(newStrokes);
      setHistory([...newHistory, newStrokes]);
      setHistoryIndex(newHistory.length);
      shapeStartRef.current = null;
      setShapeStartPoint(null);
      setPreviewStroke(null);
    } else if (currentPathRef.current.length > 1) {
      const newStroke: Stroke = {
        type: tool,
        points: [...currentPathRef.current],
        color: brushColor,
        width: brushWidth,
        symmetryMode,
      };
      const newStrokes = [...strokes, newStroke];
      const newHistory = history.slice(0, historyIndex + 1);
      setStrokes(newStrokes);
      setHistory([...newHistory, newStrokes]);
      setHistoryIndex(newHistory.length);
    }
    currentPathRef.current = [];
    setCurrentPath([]);
  };

  const drawStrokeOnCtx = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.type === "fill" && stroke.points[0]) {
      floodFill(
        Math.floor(stroke.points[0].x),
        Math.floor(stroke.points[0].y),
        stroke.color,
      );
      return;
    }
    const allPoints: Point[][] = [];
    stroke.points.forEach((pt) => allPoints.push(applySymmetry(pt)));
    const maxSymPoints = Math.max(...allPoints.map((p) => p.length));
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    for (let i = 0; i < maxSymPoints; i++) {
      ctx.beginPath();
      if (stroke.type === "line" && allPoints.length >= 2) {
        const s = allPoints[0][i % allPoints[0].length],
          end = allPoints[1][i % allPoints[1].length];
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else if (stroke.type === "curve" && allPoints.length >= 2) {
        // Saved curve strokes render with smooth Bézier (matches live preview)
        const pts = allPoints.map((p) => p[i % p.length]);
        ctx.moveTo(pts[0].x, pts[0].y);
        if (pts.length === 2) {
          ctx.lineTo(pts[1].x, pts[1].y);
        } else {
          for (let j = 1; j < pts.length - 1; j++) {
            const midX = (pts[j].x + pts[j + 1].x) / 2;
            const midY = (pts[j].y + pts[j + 1].y) / 2;
            ctx.quadraticCurveTo(pts[j].x, pts[j].y, midX, midY);
          }
          ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        }
        ctx.stroke();
      } else if (stroke.type === "freehand") {
        stroke.points.forEach((_, idx) => {
          const pt = allPoints[idx][i % allPoints[idx].length];
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      } else if (
        stroke.type === "shape" &&
        stroke.shapeType &&
        stroke.shapeDimensions
      ) {
        const cPt = allPoints[0][i % allPoints[0].length];
        const { radius } = stroke.shapeDimensions;
        switch (stroke.shapeType) {
          case "circle":
            ctx.arc(cPt.x, cPt.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
          case "square": {
            const s2 = radius * Math.sqrt(2);
            ctx.rect(cPt.x - s2 / 2, cPt.y - s2 / 2, s2, s2);
            ctx.stroke();
            break;
          }
          case "diamond":
            ctx.moveTo(cPt.x, cPt.y - radius);
            ctx.lineTo(cPt.x + radius, cPt.y);
            ctx.lineTo(cPt.x, cPt.y + radius);
            ctx.lineTo(cPt.x - radius, cPt.y);
            ctx.closePath();
            ctx.stroke();
            break;
          case "triangle": {
            const h = radius * Math.sqrt(3);
            ctx.moveTo(cPt.x, cPt.y - (2 / 3) * h);
            ctx.lineTo(cPt.x + radius, cPt.y + h / 3);
            ctx.lineTo(cPt.x - radius, cPt.y + h / 3);
            ctx.closePath();
            ctx.stroke();
            break;
          }
        }
        break;
      }
    }
  };

  const redrawCanvas = useCallback(
    (preview = false) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // In-progress strokes are handled by drawImmediate; here we only redraw committed strokes
      const strokesToDraw: Stroke[] =
        preview && previewStroke ? [...strokes, previewStroke] : [...strokes];
      strokesToDraw.forEach((s) => drawStrokeOnCtx(ctx, s));
    },
    [strokes, previewStroke, tool, brushColor, brushWidth, symmetryMode],
  );

  const clearCanvas = () => {
    setStrokes([]);
    setHistory([[]]);
    setHistoryIndex(0);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    toast.success("Canvas cleared");
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const ni = historyIndex - 1;
      setHistoryIndex(ni);
      setStrokes(history[ni]);
      toast.info("Undo");
    } else toast.info("Cannot undo further");
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const ni = historyIndex + 1;
      setHistoryIndex(ni);
      setStrokes(history[ni]);
      toast.info("Redo");
    } else toast.info("Cannot redo further");
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `kolam-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Downloaded as PNG");
  };

  const downloadPDF = async () => {
    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) throw new Error("No ctx");
      if (gridType !== "none") {
        tempCtx.fillStyle = "#DAA520";
        dots.forEach((dot) => {
          tempCtx.beginPath();
          tempCtx.arc(dot.x, dot.y, 3, 0, 2 * Math.PI);
          tempCtx.fill();
        });
      }
      tempCtx.lineCap = "round";
      tempCtx.lineJoin = "round";
      strokes.forEach((s) =>
        drawStrokeOnCtx(tempCtx as unknown as CanvasRenderingContext2D, s),
      );
      const pdf = new jsPDF("landscape", undefined, [
        canvasWidth,
        canvasHeight,
      ]);
      const ci = await html2canvas(tempCanvas);
      pdf.addImage(
        ci.toDataURL("image/png"),
        "PNG",
        0,
        0,
        canvasWidth,
        canvasHeight,
      );
      pdf.save(`kolam-${Date.now()}.pdf`);
      toast.success("Downloaded PDF");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  const printCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const pw = window.open("", "_blank");
    if (!pw) return;
    pw.document.write(
      `<html><head><title>Kolam</title></head><body style="margin:0;padding:20px;text-align:center;"><img src="${dataUrl}" style="max-width:100%;height:auto;"/></body></html>`,
    );
    pw.document.close();
    pw.focus();
    pw.print();
  };

  useEffect(() => {
    generateDots();
  }, [generateDots]);
  useEffect(() => {
    drawDots();
  }, [drawDots]);
  useEffect(() => {
    redrawCanvas();
  }, [strokes]);

  useEffect(() => {
    if (location.state && (location.state as any).imageUrl) {
      setBackgroundImageUrl((location.state as any).imageUrl);
      clearCanvas();
    }
  }, [location.state]);

  useEffect(() => {
    const dotCanvas = dotCanvasRef.current;
    if (!dotCanvas || !backgroundImageUrl) {
      drawDots();
      return;
    }
    const ctx = dotCanvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const hR = canvasWidth / img.width,
        vR = canvasHeight / img.height;
      const ratio = Math.min(hR, vR);
      const shiftX = (canvasWidth - img.width * ratio) / 2;
      const shiftY = (canvasHeight - img.height * ratio) / 2;
      const tmpC = document.createElement("canvas");
      tmpC.width = canvasWidth;
      tmpC.height = canvasHeight;
      const tmpCtx = tmpC.getContext("2d");
      if (tmpCtx) {
        tmpCtx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          shiftX,
          shiftY,
          img.width * ratio,
          img.height * ratio,
        );
        const id = tmpCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
          d[i] = d[i + 1] = d[i + 2] = avg + (avg - 128) * 0.3;
          d[i + 3] = 80;
        }
        ctx.putImageData(id, 0, 0);
      }
    };
    img.src = backgroundImageUrl;
  }, [backgroundImageUrl]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-1">
              Kolam Canvas
            </h1>
            <p className="text-muted-foreground text-sm">
              Create beautiful traditional patterns with digital precision
            </p>
          </div>
          <div className="w-20" />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Pen className="w-4 h-4 text-primary" /> Drawing Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">
                    Active Tool
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "line", label: "Line", icon: Minus },
                      { value: "curve", label: "Curve", icon: Pen },
                      { value: "freehand", label: "Freehand", icon: Brush },
                      { value: "shape", label: "Shape", icon: Square },
                      { value: "eraser", label: "Eraser", icon: Eraser },
                      { value: "fill", label: "Fill", icon: PaintBucket },
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        variant={tool === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTool(value as Tool)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Icon className="w-3 h-3" /> {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {tool === "shape" && (
                  <div>
                    <label className="block mb-1 text-sm text-muted-foreground">
                      Select Shape
                    </label>
                    <Select
                      value={shapeType}
                      onValueChange={(val) => setShapeType(val as ShapeType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                        <SelectItem value="triangle">Triangle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">
                    Brush Size: {brushWidth}px
                  </label>
                  <Slider
                    value={[brushWidth]}
                    onValueChange={(val) => setBrushWidth(val[0])}
                    min={1}
                    max={20}
                    step={1}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">
                    Color
                  </label>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-full h-8 rounded border border-border bg-transparent cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Grid3x3 className="w-4 h-4 text-primary" /> Grid Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">
                    Grid Type
                  </label>
                  <Select
                    value={gridType}
                    onValueChange={(val) => setGridType(val as GridType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectangular">
                        Rectangular (Dots)
                      </SelectItem>
                      <SelectItem value="triangular">Triangular</SelectItem>
                      <SelectItem value="circular">Circular</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block mb-2 text-sm text-mutable-foreground">
                    Rows: {gridSize.rows}
                  </label>
                  <Slider
                    value={[gridSize.rows]}
                    onValueChange={(val) =>
                      setGridSize((p) => ({ ...p, rows: val[0] }))
                    }
                    min={3}
                    max={25}
                    step={1}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">
                    Cols: {gridSize.cols}
                  </label>
                  <Slider
                    value={[gridSize.cols]}
                    onValueChange={(val) =>
                      setGridSize((p) => ({ ...p, cols: val[0] }))
                    }
                    min={3}
                    max={25}
                    step={1}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-muted-foreground">
                    Spacing: {spacing}px
                  </label>
                  <Slider
                    value={[spacing]}
                    onValueChange={(val) => setSpacing(val[0])}
                    min={15}
                    max={50}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FlipHorizontal className="w-4 h-4 text-primary" /> Symmetry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "none", label: "None", icon: Minus },
                    {
                      value: "vertical",
                      label: "Vertical",
                      icon: FlipVertical,
                    },
                    {
                      value: "horizontal",
                      label: "Horizontal",
                      icon: FlipHorizontal,
                    },
                    { value: "radial", label: "Radial", icon: RotateCcw },
                  ].map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={symmetryMode === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSymmetryMode(value as SymmetryMode)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Icon className="w-3 h-3" /> {label}
                    </Button>
                  ))}
                </div>
                {symmetryMode !== "none" && (
                  <Badge
                    variant="secondary"
                    className="mt-2 w-full justify-center text-xs"
                  >
                    {symmetryMode === "radial" ? "8-fold" : "Mirror"} symmetry
                    active
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Undo2 className="w-3 h-3" /> Undo
                  </Button>
                  <Button
                    onClick={handleRedo}
                    disabled={historyIndex === history.length - 1}
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Redo2 className="w-3 h-3" /> Redo
                  </Button>
                </div>

                <Button
                  variant="destructive"
                  onClick={clearCanvas}
                  className="w-full flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Clear All
                </Button>

                <Separator />

                <Button
                  onClick={downloadPNG}
                  className="w-full flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadPDF}
                  className="w-full flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={printCanvas}
                  className="w-full flex items-center gap-2 text-sm"
                >
                  <Printer className="w-4 h-4" /> Print
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Feather className="w-4 h-4 text-primary" /> Canvas
                  {backgroundImageUrl && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Practice Mode
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {/*
                  Both canvases are stacked inside a fixed aspect-ratio container.
                  This guarantees both share identical CSS dimensions so dots and
                  drawings are always pixel-aligned regardless of screen width.
                */}
                <div
                  className="relative w-full rounded-lg overflow-hidden bg-[#060c1a] shadow-inner border border-border"
                  style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
                >
                  {/* Dot grid layer */}
                  <canvas
                    ref={dotCanvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />
                  {/* Drawing layer */}
                  <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    className="absolute inset-0 w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-amber-400 px-2 py-1 rounded text-xs font-medium pointer-events-none">
                    {tool.charAt(0).toUpperCase() + tool.slice(1)} Tool
                    {symmetryMode !== "none" && ` • ${symmetryMode} symmetry`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasPage;
