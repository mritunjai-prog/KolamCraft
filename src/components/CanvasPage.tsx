import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

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
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type GridType = "rectangular" | "triangular" | "circular" | "none";
type Tool =
  | "line"
  | "curve"
  | "eraser"
  | "fill"
  | "freehand"
  | "shape";
type ShapeType = "circle" | "diamond" | "triangle" | "square";
type SymmetryMode =
  | "none"
  | "vertical"
  | "horizontal"
  | "radial";

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
  const { user } = useAuth();
  const location = useLocation();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("line");
  const [shapeType, setShapeType] = useState<ShapeType>("circle");
  const [gridType, setGridType] = useState<GridType>("rectangular");
  const [dots, setDots] = useState<Point[]>([]);
  const [gridSize, setGridSize] = useState({
    rows: 15,
    cols: 15,
  });
  const [spacing, setSpacing] = useState(30);
  const [symmetryMode, setSymmetryMode] = useState<SymmetryMode>("none");
  const [brushColor, setBrushColor] = useState("#ff6b35");
  const [brushWidth, setBrushWidth] = useState(3);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [history, setHistory] = useState<Stroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);

  const [shapeStartPoint, setShapeStartPoint] = useState<Point | null>(
    null,
  );
  const [previewStroke, setPreviewStroke] = useState<Stroke | null>(null);

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
          const rowOffset = (row % 2) * spacing / 2;
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
  }, [
    gridType,
    gridSize,
    spacing,
    canvasWidth,
    canvasHeight,
  ]);

  const drawDots = useCallback(() => {
    const dotCanvas = dotCanvasRef.current;
    if (!dotCanvas) return;
    const ctx = dotCanvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (gridType === "none") return;
    ctx.fillStyle = "#e2e8f0";
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
        points.push({
          x: canvasWidth - point.x,
          y: point.y,
        });
        break;
      case "horizontal":
        points.push({
          x: point.x,
          y: canvasHeight - point.y,
        });
        break;
      case "radial":
        for (let i = 1; i < 8; i++) {
          const angle = (i / 4) * Math.PI;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const dx = point.x - centerX;
          const dy = point.y - centerY;
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
      if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight)
        continue;

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

        pixelStack.push({ x: x + 1, y });
        pixelStack.push({ x: x - 1, y });
        pixelStack.push({ x, y: y + 1 });
        pixelStack.push({ x, y: y - 1 });
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const getMousePos = (
    e: React.MouseEvent<HTMLCanvasElement>,
  ): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    if (tool === "fill") {
      setStrokes((prev) => [...prev, {
        type: "fill",
        points: [point],
        color: brushColor,
        width: 0,
        symmetryMode: "none",
      }]);
      return;
    }
    setIsDrawing(true);
    if (tool === "freehand" || tool === "curve") {
      setCurrentPath([point]);
      return;
    }
    if (tool === "line") {
      setCurrentPath([findNearestDot(point)]);
      return;
    }
    if (tool === "shape") {
      setShapeStartPoint(findNearestDot(point));
      setPreviewStroke(null);
      return;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
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
      setCurrentPath((p) => [...p, point]);
    }

    if (tool === "line") {
      const snappedPoint = findNearestDot(point);
      setCurrentPath([currentPath[0], snappedPoint]);
    }

    if (tool === "shape" && shapeStartPoint) {
      const radius = Math.hypot(
        point.x - shapeStartPoint.x,
        point.y - shapeStartPoint.y,
      );
      const preview: Stroke = {
        type: "shape",
        points: [shapeStartPoint],
        color: brushColor,
        width: brushWidth,
        symmetryMode,
        shapeType,
        shapeDimensions: { radius },
      };
      setPreviewStroke(preview);
    }
    redrawCanvas(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (tool === "eraser" || tool === "fill") return;

    if (tool === "shape" && shapeStartPoint && previewStroke) {
      const newStrokes = [...strokes, previewStroke];
      const newHistory = history.slice(0, historyIndex + 1);
      setStrokes(newStrokes);
      setHistory([...newHistory, newStrokes]);
      setHistoryIndex(newHistory.length);
      setShapeStartPoint(null);
      setPreviewStroke(null);
    } else if (currentPath.length > 1) {
      const newStroke: Stroke = {
        type: tool,
        points: currentPath,
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
    setCurrentPath([]);
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

      const strokesToDraw = preview && previewStroke
          ? [...strokes, previewStroke]
          : strokes;
      
      if(currentPath.length > 0 && (tool === 'line' || tool === 'freehand' || tool === 'curve')) {
          const tempStroke: Stroke = {
              type: tool,
              points: currentPath,
              color: brushColor,
              width: brushWidth,
              symmetryMode
          };
          strokesToDraw.push(tempStroke);
      }
    
      const drawStroke = (stroke: Stroke) => {
        if (stroke.type === "fill" && stroke.points[0]) {
          floodFill(
            Math.floor(stroke.points[0].x),
            Math.floor(stroke.points[0].y),
            stroke.color
          );
          return;
        }

        const allPoints: Point[][] = [];
        stroke.points.forEach((pt) =>
          allPoints.push(applySymmetry(pt))
        );
        const maxSymPoints = Math.max(
          ...allPoints.map((p) => p.length),
        );

        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;

        for (let i = 0; i < maxSymPoints; i++) {
          ctx.beginPath();
  
          if (
            stroke.type === "line" &&
            allPoints.length >= 2
          ) {
            const startPt = allPoints[0][i % allPoints[0].length];
            const endPt = allPoints[1][i % allPoints[1].length];
            ctx.moveTo(startPt.x, startPt.y);
            ctx.lineTo(endPt.x, endPt.y);
            ctx.stroke();
          } else if (
            stroke.type === "curve" &&
            allPoints.length >= 2
          ) {
            const startPt = allPoints[0][i % allPoints[0].length];
            ctx.moveTo(startPt.x, startPt.y);
            const pathPoints = allPoints.map(p => p[i % p.length]);
            for(let j=1; j < pathPoints.length; j++) {
              ctx.lineTo(pathPoints[j].x, pathPoints[j].y);
            }
            ctx.stroke();
          } else if (
            stroke.type === "freehand"
          ) {
            stroke.points.forEach(
              (pt, idx) => {
                if (idx === 0) {
                  ctx.moveTo(
                    allPoints[idx][
                      i % allPoints[idx].length
                    ].x,
                    allPoints[idx][
                      i % allPoints[idx].length
                    ].y,
                  );
                } else {
                  ctx.lineTo(
                    allPoints[idx][
                      i % allPoints[idx].length
                    ].x,
                    allPoints[idx][
                      i % allPoints[idx].length
                    ].y,
                  );
                }
              },
            );
            ctx.stroke();
          } else if (
            stroke.type === "shape" &&
            stroke.shapeType &&
            stroke.shapeDimensions
          ) {
            const centerPt = allPoints[0][i % allPoints[0].length];
            const { radius } = stroke.shapeDimensions;
            switch (stroke.shapeType) {
              case "circle":
                ctx.beginPath();
                ctx.arc(centerPt.x, centerPt.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
                break;
              case "square":
                const side = radius * Math.sqrt(2);
                ctx.beginPath();
                ctx.rect(
                  centerPt.x - side / 2,
                  centerPt.y - side / 2,
                  side,
                  side,
                );
                ctx.stroke();
                break;
              case "diamond":
                ctx.beginPath();
                ctx.moveTo(centerPt.x, centerPt.y - radius);
                ctx.lineTo(centerPt.x + radius, centerPt.y);
                ctx.lineTo(centerPt.x, centerPt.y + radius);
                ctx.lineTo(centerPt.x - radius, centerPt.y);
                ctx.closePath();
                ctx.stroke();
                break;
              case "triangle":
                const height = radius * Math.sqrt(3);
                ctx.beginPath();
                ctx.moveTo(
                  centerPt.x,
                  centerPt.y - (2 / 3) * height,
                );
                ctx.lineTo(
                  centerPt.x + radius,
                  centerPt.y + height / 3,
                );
                ctx.lineTo(
                  centerPt.x - radius,
                  centerPt.y + height / 3,
                );
                ctx.closePath();
                ctx.stroke();
                break;
            }
            break;
          }
        }
      };

      strokesToDraw.forEach(drawStroke);
    },
    [
      strokes,
      previewStroke,
      currentPath,
      tool,
      brushColor,
      brushWidth,
      symmetryMode,
      applySymmetry,
    ],
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
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setStrokes(history[newIndex]);
      toast.info("Undo successful");
    } else {
      toast.info("Cannot undo further");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setStrokes(history[newIndex]);
      toast.info("Redo successful");
    } else {
      toast.info("Cannot redo further");
    }
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
      if (!jsPDF || !html2canvas) {
        toast.error("Required libraries (jsPDF, html2canvas) not loaded.");
        return;
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error("Could not create temporary canvas context");

      if (gridType !== "none") {
        tempCtx.fillStyle = "#e2e8f0";
        dots.forEach((dot) => {
          tempCtx.beginPath();
          tempCtx.arc(dot.x, dot.y, 3, 0, 2 * Math.PI);
          tempCtx.fill();
        });
      }

      const strokesToDraw = [...strokes];
      tempCtx.lineCap = "round";
      tempCtx.lineJoin = "round";

      const drawStrokeOnTemp = (stroke: Stroke) => {
        if (stroke.type === "fill" && stroke.points[0]) {
          const startX = stroke.points[0].x;
          const startY = stroke.points[0].y;
          
          const imageData = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight);
          const data = imageData.data;

          const startPixel = (startY * canvasWidth + startX) * 4;
          const targetColor = {
            r: data[startPixel],
            g: data[startPixel + 1],
            b: data[startPixel + 2],
            a: data[startPixel + 3],
          };
          const fillRGB = hexToRgb(stroke.color);
          if (!fillRGB || (fillRGB.r === targetColor.r && fillRGB.g === targetColor.g && fillRGB.b === targetColor.b)) return;
          const pixelStack: Point[] = [{ x: startX, y: startY }];

          while (pixelStack.length) {
            const { x, y } = pixelStack.pop()!;
            if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) continue;

            const idx = (y * canvasWidth + x) * 4;
            if (
              data[idx] === targetColor.r && data[idx + 1] === targetColor.g &&
              data[idx + 2] === targetColor.b && data[idx + 3] === targetColor.a
            ) {
              data[idx] = fillRGB.r;
              data[idx + 1] = fillRGB.g;
              data[idx + 2] = fillRGB.b;
              data[idx + 3] = 255;

              pixelStack.push({ x: x + 1, y });
              pixelStack.push({ x: x - 1, y });
              pixelStack.push({ x, y: y + 1 });
              pixelStack.push({ x, y: y - 1 });
            }
          }
          tempCtx.putImageData(imageData, 0, 0);
          return;
        }

        const allPoints: Point[][] = [];
        stroke.points.forEach((pt) =>
          allPoints.push(applySymmetry(pt))
        );
        const maxSymPoints = Math.max(
          ...allPoints.map((p) => p.length),
        );

        tempCtx.strokeStyle = stroke.color;
        tempCtx.lineWidth = stroke.width;

        for (let i = 0; i < maxSymPoints; i++) {
          tempCtx.beginPath();
  
          if (
            stroke.type === "line" &&
            allPoints.length >= 2
          ) {
            const startPt = allPoints[0][i % allPoints[0].length];
            const endPt = allPoints[1][i % allPoints[1].length];
            tempCtx.moveTo(startPt.x, startPt.y);
            tempCtx.lineTo(endPt.x, endPt.y);
            tempCtx.stroke();
          } else if (
            stroke.type === "curve" &&
            allPoints.length >= 2
          ) {
            const startPt = allPoints[0][i % allPoints[0].length];
            tempCtx.moveTo(startPt.x, startPt.y);
            const pathPoints = allPoints.map(p => p[i % p.length]);
            for(let j=1; j < pathPoints.length; j++) {
              tempCtx.lineTo(pathPoints[j].x, pathPoints[j].y);
            }
            tempCtx.stroke();
          } else if (
            stroke.type === "freehand"
          ) {
            stroke.points.forEach(
              (pt, idx) => {
                if (idx === 0) {
                  tempCtx.moveTo(
                    allPoints[idx][
                      i % allPoints[idx].length
                    ].x,
                    allPoints[idx][
                      i % allPoints[idx].length
                    ].y,
                  );
                } else {
                  tempCtx.lineTo(
                    allPoints[idx][
                      i % allPoints[idx].length
                    ].x,
                    allPoints[idx][
                      i % allPoints[idx].length
                    ].y,
                  );
                }
              },
            );
            tempCtx.stroke();
          } else if (
            stroke.type === "shape" &&
            stroke.shapeType &&
            stroke.shapeDimensions
          ) {
            const centerPt = allPoints[0][i % allPoints[0].length];
            const { radius } = stroke.shapeDimensions;
            switch (stroke.shapeType) {
              case "circle":
                tempCtx.beginPath();
                tempCtx.arc(centerPt.x, centerPt.y, radius, 0, 2 * Math.PI);
                tempCtx.stroke();
                break;
              case "square":
                const side = radius * Math.sqrt(2);
                tempCtx.beginPath();
                tempCtx.rect(
                  centerPt.x - side / 2,
                  centerPt.y - side / 2,
                  side,
                  side,
                );
                tempCtx.stroke();
                break;
              case "diamond":
                tempCtx.beginPath();
                tempCtx.moveTo(centerPt.x, centerPt.y - radius);
                tempCtx.lineTo(centerPt.x + radius, centerPt.y);
                tempCtx.lineTo(centerPt.x, centerPt.y + radius);
                tempCtx.lineTo(centerPt.x - radius, centerPt.y);
                tempCtx.closePath();
                tempCtx.stroke();
                break;
              case "triangle":
                const height = radius * Math.sqrt(3);
                tempCtx.beginPath();
                tempCtx.moveTo(
                  centerPt.x,
                  centerPt.y - (2 / 3) * height,
                );
                tempCtx.lineTo(
                  centerPt.x + radius,
                  centerPt.y + height / 3,
                );
                tempCtx.lineTo(
                  centerPt.x - radius,
                  centerPt.y + height / 3,
                );
                tempCtx.closePath();
                tempCtx.stroke();
                break;
            }
            break;
          }
        }
      };

      strokesToDraw.forEach(drawStrokeOnTemp);

      const pdf = new jsPDF("landscape", undefined, [
        canvasWidth,
        canvasHeight,
      ]);
      const canvasImage = await html2canvas(tempCanvas);
      const imgData = canvasImage.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, canvasWidth, canvasHeight);
      pdf.save(`kolam-${Date.now()}.pdf`);
      toast.success("Downloaded PDF");
    } catch(err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  const printCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>Kolam Design</title></head>
        <body style="margin: 0; padding: 20px; text-align: center;">
          <img src="${dataUrl}" style="max-width: 100%; height: auto;" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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

  // Use a single useEffect for both location state and image URL
  useEffect(() => {
    if (location.state && location.state.imageUrl) {
      setBackgroundImageUrl(location.state.imageUrl);
      clearCanvas();
    }
  }, [location.state]);

  // Handle and draw the background image once
  useEffect(() => {
    const dotCanvas = dotCanvasRef.current;
    if (!dotCanvas || !backgroundImageUrl) {
      drawDots();
      return;
    }

    const ctx = dotCanvas.getContext('2d');
    if (!ctx) return;

    // Clear the background canvas before drawing the new image/dots
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      console.log("Image loaded successfully:", backgroundImageUrl);
      // Draw the image scaled to fit the canvas
      const hRatio = canvasWidth / img.width;
      const vRatio = canvasHeight / img.height;
      const ratio = Math.min(hRatio, vRatio);
      const centerShiftX = (canvasWidth - img.width * ratio) / 2;
      const centerShiftY = (canvasHeight - img.height * ratio) / 2;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasWidth;
      tempCanvas.height = canvasHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(
          img, 0, 0, img.width, img.height,
          centerShiftX, centerShiftY, img.width * ratio, img.height * ratio
        );
        
        // Convert to faint grayscale
        const imageData = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const contrast = 0.3; // Reduced contrast for a lighter effect
          data[i] = avg + (avg - 128) * contrast;
          data[i + 1] = avg + (avg - 128) * contrast;
          data[i + 2] = avg + (avg - 128) * contrast;
          data[i + 3] = 100; // Reduced opacity
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
    };
    img.onerror = () => {
      console.error("Failed to load image:", backgroundImageUrl);
    };
    img.src = backgroundImageUrl;

  }, [backgroundImageUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-4xl mb-2">Kolam Canvas</h1>
          <p className="text-gray-600">
            Create beautiful traditional patterns with digital precision
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pen className="w-5 h-5" />
                  Drawing Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block mb-2">Active Tool</label>
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
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {tool === "shape" && (
                  <>
                    <label className="block mb-1">
                      Select Shape
                    </label>
                    <Select
                      value={shapeType}
                      onValueChange={(val) =>
                        setShapeType(val as ShapeType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="circle">
                          Circle
                        </SelectItem>
                        <SelectItem value="square">
                          Square
                        </SelectItem>
                        <SelectItem value="diamond">
                          Diamond
                        </SelectItem>
                        <SelectItem value="triangle">
                          Triangle
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                <div>
                  <label className="block mb-2">
                    Brush Size: {brushWidth}px
                  </label>
                  <Slider
                    value={[brushWidth]}
                    onValueChange={(val) =>
                      setBrushWidth(val[0])
                    }
                    min={1}
                    max={20}
                    step={1}
                  />
                </div>

                <div>
                  <label className="block mb-2">Color</label>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) =>
                      setBrushColor(e.target.value)
                    }
                    className="w-full h-8 rounded border"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5" />
                  Grid Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block mb-2">Grid Type</label>
                  <Select
                    value={gridType}
                    onValueChange={(val) =>
                      setGridType(val as GridType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectangular">
                        Rectangular (Dots)
                      </SelectItem>
                      <SelectItem value="triangular">
                        Triangular
                      </SelectItem>
                      <SelectItem value="circular">
                        Circular
                      </SelectItem>
                      <SelectItem value="none">
                        None
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block mb-2">Rows: {gridSize.rows}</label>
                  <Slider
                    value={[gridSize.rows]}
                    onValueChange={(val) =>
                      setGridSize((prev) => ({
                        ...prev,
                        rows: val[0],
                      }))
                    }
                    min={3}
                    max={25}
                    step={1}
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    Columns: {gridSize.cols}
                  </label>
                  <Slider
                    value={[gridSize.cols]}
                    onValueChange={(val) =>
                      setGridSize((prev) => ({
                        ...prev,
                        cols: val[0],
                      }))
                    }
                    min={3}
                    max={25}
                    step={1}
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    Spacing: {spacing}px
                  </label>
                  <Slider
                    value={[spacing]}
                    onValueChange={(val) =>
                      setSpacing(val[0])
                    }
                    min={15}
                    max={50}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlipHorizontal className="w-5 h-5" />
                  Symmetry
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
                      variant={
                        symmetryMode === value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSymmetryMode(value as SymmetryMode)
                      }
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Button>
                  ))}
                </div>
                {symmetryMode !== "none" && (
                  <Badge
                    variant="secondary"
                    className="mt-2 w-full justify-center"
                  >
                    {symmetryMode === "radial"
                      ? "8-fold"
                      : "Mirror"}{" "}
                    symmetry active
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                    className="flex items-center justify-center gap-2"
                  >
                    <Undo2 className="w-4 h-4" />
                    Undo
                  </Button>
                  <Button
                    onClick={handleRedo}
                    disabled={historyIndex === history.length - 1}
                    className="flex items-center justify-center gap-2"
                  >
                    <Redo2 className="w-4 h-4" />
                    Redo
                  </Button>
                </div>
                
                <Button
                  variant="destructive"
                  onClick={clearCanvas}
                  className="w-full flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>

                <Separator />

                <Button
                  onClick={downloadPNG}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </Button>

                <Button
                  variant="outline"
                  onClick={downloadPDF}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={printCanvas}
                  className="w-full flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Canvas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-white rounded-lg shadow-inner border">
                  <canvas
                    ref={dotCanvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    className="absolute inset-0 pointer-events-none"
                  />
                  <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    className="relative cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />

                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {tool.charAt(0).toUpperCase() + tool.slice(1)} Tool
                    {symmetryMode !== "none" &&
                      ` • ${symmetryMode} symmetry`}
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