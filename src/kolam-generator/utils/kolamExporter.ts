import html2canvas from "html2canvas";
import { ExportOptions, KolamPattern } from "../types/kolam";

export class KolamExporter {
  static async exportAsSVG(pattern: KolamPattern): Promise<string> {
    const { dimensions, dots, curves } = pattern;

    let svgContent = `<svg width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}" xmlns="http://www.w3.org/2000/svg">`;

    dots.forEach((dot) => {
      svgContent += `<circle cx="${dot.center.x}" cy="${dot.center.y}" r="${dot.radius || 3}" fill="${dot.filled ? dot.color || "white" : "none"}" stroke="${dot.color || "white"}" stroke-width="${dot.filled ? 0 : 1}" />`;
    });

    curves.forEach((curve) => {
      if (curve.curvePoints && curve.curvePoints.length > 1) {
        let pathData = `M ${curve.curvePoints[0].x} ${curve.curvePoints[0].y}`;
        for (let i = 1; i < curve.curvePoints.length; i++) {
          const point = curve.curvePoints[i];
          const prevPoint = curve.curvePoints[i - 1];
          const controlX = (prevPoint.x + point.x) / 2;
          const controlY = (prevPoint.y + point.y) / 2;
          pathData += ` Q ${controlX} ${controlY} ${point.x} ${point.y}`;
        }
        svgContent += `<path d="${pathData}" stroke="${curve.color || "white"}" stroke-width="${curve.strokeWidth || 2}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
      } else {
        svgContent += `<line x1="${curve.start.x}" y1="${curve.start.y}" x2="${curve.end.x}" y2="${curve.end.y}" stroke="${curve.color || "white"}" stroke-width="${curve.strokeWidth || 2}" stroke-linecap="round" />`;
      }
    });

    svgContent += "</svg>";
    return svgContent;
  }

  static async downloadSVG(
    pattern: KolamPattern,
    filename?: string,
  ): Promise<void> {
    const svgContent = await this.exportAsSVG(pattern);
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `${pattern.name}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async exportAsPNG(
    element: HTMLElement,
    options: ExportOptions = { format: "png" },
  ): Promise<string> {
    const canvas = await html2canvas(element, {
      backgroundColor: options.backgroundColor || "#7b3306",
      scale: options.scale || 2,
      useCORS: true,
    });
    return canvas.toDataURL("image/png");
  }

  static async downloadPNG(
    element: HTMLElement,
    filename: string,
    options: ExportOptions = { format: "png" },
  ): Promise<void> {
    const dataUrl = await this.exportAsPNG(element, options);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
