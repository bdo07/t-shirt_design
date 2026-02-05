import { useCallback, useState, RefObject } from 'react';
import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';

export type ExportFormat = 'png' | 'jpg' | 'pdf';

interface UseExportOptions {
  ref: RefObject<HTMLDivElement | null>;
  filename?: string;
  scale?: number;
}

interface UseExportReturn {
  exportAsFile: (format: ExportFormat) => Promise<void>;
  exportComposite: (format: ExportFormat, views: string[]) => Promise<void>;
  isExporting: boolean;
  exportError: string | null;
}

export function useExport({ ref, filename = 't-shirt-design', scale = 2 }: UseExportOptions): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const captureCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!ref.current) return null;
    try {
      // Get the actual size of the preview container
      const rect = ref.current.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      // Use dom-to-image to export the full preview area as rendered
      const dataUrl = await domtoimage.toPng(ref.current, {
        width,
        height,
        bgcolor: '#fff',
        cacheBust: true,
        style: {
          transform: 'none',
          zoom: '1',
        },
      });
      const img = new window.Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0, width, height);
      return canvas;
    } catch (err) {
      console.error('Canvas capture failed:', err);
      return null;
    }
  }, [ref]);

  const exportAsFile = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const canvas = await captureCanvas();
      if (!canvas) {
        throw new Error('Failed to capture the design canvas.');
      }

      const timestamp = Date.now();
      const link = document.createElement('a');

      if (format === 'png') {
        link.download = `${filename}-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else if (format === 'jpg') {
        // For JPG, we need a white background since JPG doesn't support transparency
        const jpgCanvas = document.createElement('canvas');
        jpgCanvas.width = canvas.width;
        jpgCanvas.height = canvas.height;
        const ctx = jpgCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
          ctx.drawImage(canvas, 0, 0);
        }
        link.download = `${filename}-${timestamp}.jpg`;
        link.href = jpgCanvas.toDataURL('image/jpeg', 0.95);
        link.click();
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Determine orientation
        const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
          orientation,
          unit: 'px',
          format: [imgWidth, imgHeight],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${filename}-${timestamp}.pdf`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed. Please try again.';
      setExportError(message);
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [captureCanvas, filename]);

  const exportComposite = useCallback(async (format: ExportFormat, _views: string[]) => {
    // For composite export, we just export the current view
    // This could be extended to stitch multiple views together
    await exportAsFile(format);
  }, [exportAsFile]);

  return { exportAsFile, exportComposite, isExporting, exportError };
}
