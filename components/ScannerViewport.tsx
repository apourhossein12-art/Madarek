'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Crop,
  Eye,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Wand2,
  Maximize2,
  Sparkles,
  Scan,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Grid,
} from 'lucide-react';
import { DocumentItem, FourCorners, Point } from '@/lib/image-types';
import { toPersianDigits } from '@/lib/image-math';
import { detectDocumentCorners } from '@/lib/perspective-warp';

interface ScannerViewportProps {
  documentItem: DocumentItem;
  viewTab: 'crop' | 'preview';
  onChangeViewTab: (tab: 'crop' | 'preview') => void;
  onUpdateCorners: (corners: FourCorners) => void;
  onRotate: (direction: 'cw' | 'ccw') => void;
  onFlip: () => void;
  isOpenCvReady: boolean;
}

interface ImageGeometry {
  fitScale: number;
  renderW: number;
  renderH: number;
  offsetX: number;
  offsetY: number;
  imgW: number;
  imgH: number;
}

const CORNER_NAMES = [
  '۱. بالا-راست',
  '۲. بالا-چپ',
  '۳. پایین-چپ',
  '۴. پایین-راست',
];

export default function ScannerViewport({
  documentItem,
  viewTab,
  onChangeViewTab,
  onUpdateCorners,
  onRotate,
  onFlip,
  isOpenCvReady,
}: ScannerViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);

  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [activeCornerIdx, setActiveCornerIdx] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loupePoint, setLoupePoint] = useState<Point | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  // Local corners to guarantee ZERO image jumping during drag
  const [localCorners, setLocalCorners] = useState<FourCorners>([
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ]);

  // Locked image geometry ref so image position NEVER moves during drag
  const geometryRef = useRef<ImageGeometry | null>(null);

  // Sync corners from documentItem when not dragging
  useEffect(() => {
    if (isDragging) return;
    if (documentItem.adjustments.cropCorners) {
      setLocalCorners(documentItem.adjustments.cropCorners);
    }
  }, [documentItem.adjustments.cropCorners, isDragging]);

  // Load image element
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = documentItem.originalDataUrl;
    img.onload = () => {
      setImgElement(img);
      // Initialize corners if needed
      if (!documentItem.adjustments.cropCorners) {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const initCorners: FourCorners = [
          { x: Math.round(w * 0.05), y: Math.round(h * 0.05) },
          { x: Math.round(w * 0.95), y: Math.round(h * 0.05) },
          { x: Math.round(w * 0.95), y: Math.round(h * 0.95) },
          { x: Math.round(w * 0.05), y: Math.round(h * 0.95) },
        ];
        setLocalCorners(initCorners);
        onUpdateCorners(initCorners);
      }
    };
  }, [documentItem.originalDataUrl, documentItem.adjustments.cropCorners, onUpdateCorners]);

  // Compute fixed stable geometry
  const updateGeometry = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imgElement) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight || 480;

    const imgW = imgElement.naturalWidth || imgElement.width;
    const imgH = imgElement.naturalHeight || imgElement.height;

    // Scale to fit neatly inside canvas with padding
    const padding = 24;
    const fitScale = Math.min(
      (containerW - padding * 2) / imgW,
      (containerH - padding * 2) / imgH,
      1
    );

    const renderW = Math.round(imgW * fitScale);
    const renderH = Math.round(imgH * fitScale);
    const offsetX = Math.round((containerW - renderW) / 2);
    const offsetY = Math.round((containerH - renderH) / 2);

    canvas.width = containerW;
    canvas.height = containerH;

    geometryRef.current = {
      fitScale,
      renderW,
      renderH,
      offsetX,
      offsetY,
      imgW,
      imgH,
    };
  }, [imgElement]);

  // Draw crop overlay on canvas
  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!geometryRef.current) {
      updateGeometry();
    }
    const geom = geometryRef.current;
    if (!geom) return;

    const { fitScale, renderW, renderH, offsetX, offsetY, imgW, imgH } = geom;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw frozen source image
    ctx.drawImage(imgElement, offsetX, offsetY, renderW, renderH);

    // Optional alignment grid
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      const step = 32;
      for (let gx = offsetX; gx <= offsetX + renderW; gx += step) {
        ctx.beginPath();
        ctx.moveTo(gx, offsetY);
        ctx.lineTo(gx, offsetY + renderH);
        ctx.stroke();
      }
      for (let gy = offsetY; gy <= offsetY + renderH; gy += step) {
        ctx.beginPath();
        ctx.moveTo(offsetX, gy);
        ctx.lineTo(offsetX + renderW, gy);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Map corners to canvas coordinates
    const screenPts = localCorners.map((pt) => ({
      x: offsetX + pt.x * fitScale,
      y: offsetY + pt.y * fitScale,
    }));

    // 3. Dark mask outside quadrilateral
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.moveTo(screenPts[0].x, screenPts[0].y);
    ctx.lineTo(screenPts[3].x, screenPts[3].y);
    ctx.lineTo(screenPts[2].x, screenPts[2].y);
    ctx.lineTo(screenPts[1].x, screenPts[1].y);
    ctx.closePath();
    ctx.fill('evenodd');
    ctx.restore();

    // 4. Polygon outline with glowing emerald border
    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(screenPts[0].x, screenPts[0].y);
    ctx.lineTo(screenPts[1].x, screenPts[1].y);
    ctx.lineTo(screenPts[2].x, screenPts[2].y);
    ctx.lineTo(screenPts[3].x, screenPts[3].y);
    ctx.closePath();
    ctx.stroke();

    // Subtle diagonals
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(screenPts[0].x, screenPts[0].y);
    ctx.lineTo(screenPts[2].x, screenPts[2].y);
    ctx.moveTo(screenPts[1].x, screenPts[1].y);
    ctx.lineTo(screenPts[3].x, screenPts[3].y);
    ctx.stroke();
    ctx.restore();

    // 5. Draw 4 Corner Handles with Badges
    screenPts.forEach((pt, idx) => {
      const isSelected = activeCornerIdx === idx;

      ctx.save();
      // Outer touch target circle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isSelected ? 18 : 14, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.85)';
      ctx.fill();

      // Pin center
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isSelected ? 11 : 8, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#059669' : '#10b981';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Number badge above corner
      const badgeY = pt.y > 40 ? pt.y - 20 : pt.y + 25;
      ctx.fillStyle = isSelected ? '#059669' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(pt.x - 14, badgeY - 10, 28, 20, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Vazirmatn, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(idx + 1), pt.x, badgeY);

      ctx.restore();
    });
  }, [imgElement, localCorners, activeCornerIdx, showGrid, updateGeometry]);

  // Initial draw and window resize
  useEffect(() => {
    if (viewTab === 'crop') {
      updateGeometry();
      drawOverlay();
    }
  }, [viewTab, updateGeometry, drawOverlay]);

  useEffect(() => {
    const handleResize = () => {
      if (viewTab === 'crop') {
        updateGeometry();
        drawOverlay();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewTab, updateGeometry, drawOverlay]);

  // Redraw when local corners or active corner change
  useEffect(() => {
    if (viewTab === 'crop') {
      drawOverlay();
    }
  }, [viewTab, localCorners, activeCornerIdx, drawOverlay]);

  // Magnifying Loupe rendering
  const drawLoupe = useCallback((centerImgPt: Point) => {
    const loupeCanvas = loupeCanvasRef.current;
    if (!loupeCanvas || !imgElement) return;

    const ctx = loupeCanvas.getContext('2d');
    if (!ctx) return;

    const size = 130;
    loupeCanvas.width = size;
    loupeCanvas.height = size;

    const zoom = 2.6;
    const sourceW = size / zoom;
    const sourceH = size / zoom;
    const sourceX = centerImgPt.x - sourceW / 2;
    const sourceY = centerImgPt.y - sourceH / 2;

    ctx.clearRect(0, 0, size, size);

    // Circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(imgElement, sourceX, sourceY, sourceW, sourceH, 0, 0, size, size);

    // Crosshair
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size / 2 - 12, size / 2);
    ctx.lineTo(size / 2 + 12, size / 2);
    ctx.moveTo(size / 2, size / 2 - 12);
    ctx.lineTo(size / 2, size / 2 + 12);
    ctx.stroke();

    ctx.restore();

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [imgElement]);

  // Touch and Mouse Drag Handlers
  const pointerStart = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const geom = geometryRef.current;
    if (!canvas || !geom) return;

    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    // Hit test corner handles with generous 36px touch radius
    const hitRadius = 36;
    for (let i = 0; i < 4; i++) {
      const screenX = geom.offsetX + localCorners[i].x * geom.fitScale;
      const screenY = geom.offsetY + localCorners[i].y * geom.fitScale;
      const dist = Math.hypot(px - screenX, py - screenY);

      if (dist <= hitRadius) {
        setActiveCornerIdx(i);
        setIsDragging(true);
        setLoupePoint(localCorners[i]);
        drawLoupe(localCorners[i]);
        break;
      }
    }
  };

  const pointerMove = (clientX: number, clientY: number) => {
    if (!isDragging || activeCornerIdx === null) return;
    const canvas = canvasRef.current;
    const geom = geometryRef.current;
    if (!canvas || !geom) return;

    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    // Convert to image coordinates
    let newImgX = Math.round((px - geom.offsetX) / geom.fitScale);
    let newImgY = Math.round((py - geom.offsetY) / geom.fitScale);

    // Clamp strictly within image bounds
    newImgX = Math.max(0, Math.min(geom.imgW, newImgX));
    newImgY = Math.max(0, Math.min(geom.imgH, newImgY));

    const next: FourCorners = [...localCorners] as FourCorners;
    next[activeCornerIdx] = { x: newImgX, y: newImgY };

    // Update ONLY local state (zero parent re-render during drag!)
    setLocalCorners(next);
    setLoupePoint(next[activeCornerIdx]);
    drawLoupe(next[activeCornerIdx]);
  };

  const pointerEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      setLoupePoint(null);
      // Commit corners to parent only once drag finishes!
      onUpdateCorners(localCorners);
    }
  };

  // Attach non-passive touch listeners directly to canvas to prevent mobile page scroll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        pointerStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        pointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      pointerEnd();
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  });

  // Mouse window listeners during drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      pointerMove(e.clientX, e.clientY);
    };
    const handleMouseUp = () => {
      pointerEnd();
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  // Micro Nudge Handlers (D-Pad) for sub-pixel mobile alignment
  const nudgeCorner = (dx: number, dy: number) => {
    const geom = geometryRef.current;
    if (!geom) return;

    const next: FourCorners = [...localCorners] as FourCorners;
    const current = next[activeCornerIdx];

    const nx = Math.max(0, Math.min(geom.imgW, current.x + dx));
    const ny = Math.max(0, Math.min(geom.imgH, current.y + dy));

    next[activeCornerIdx] = { x: nx, y: ny };
    setLocalCorners(next);
    onUpdateCorners(next);
  };

  // Auto Detect Corners with OpenCV
  const handleAutoDetect = () => {
    if (!imgElement) return;
    const detected = detectDocumentCorners(imgElement);
    setLocalCorners(detected);
    onUpdateCorners(detected);
  };

  // Full Frame
  const handleFullFrame = () => {
    if (!imgElement) return;
    const w = imgElement.naturalWidth || imgElement.width;
    const h = imgElement.naturalHeight || imgElement.height;
    const full: FourCorners = [
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: w, y: h },
      { x: 0, y: h },
    ];
    setLocalCorners(full);
    onUpdateCorners(full);
  };

  return (
    <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition">
      {/* Top Bar: Tabs & Viewport Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/70 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/70">
        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => onChangeViewTab('crop')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              viewTab === 'crop'
                ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Crop className="h-3.5 w-3.5" />
            <span>تنظیم ۴ گوشه سند</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewTab('preview')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              viewTab === 'preview'
                ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>پیش‌نمایش خروجی</span>
          </button>
        </div>

        {/* Viewport Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {viewTab === 'crop' && (
            <>
              <button
                type="button"
                onClick={handleAutoDetect}
                className="flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition"
                title="تشخیص خودکار لبه‌های سند با هوش‌مصنوعی"
              >
                <Wand2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden xs:inline">تشخیص خودکار سند</span>
              </button>
              <button
                type="button"
                onClick={handleFullFrame}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 transition"
                title="انتخاب کل تصویر"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">کل کادر</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`rounded-xl border p-1.5 transition ${
                  showGrid
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}
                title="خطوط راهنمای شبکه"
              >
                <Grid className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Rotations */}
          <button
            type="button"
            onClick={() => onRotate('ccw')}
            className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 transition"
            title="چرخش ۹۰ درجه چپ"
            aria-label="چرخش ۹۰ درجه چپ"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onRotate('cw')}
            className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 transition"
            title="چرخش ۹۰ درجه راست"
            aria-label="چرخش ۹۰ درجه راست"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onFlip}
            className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 transition"
            title="قرینه‌سازی افقی"
            aria-label="قرینه‌سازی افقی"
          >
            <FlipHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport Workspace with strictly locked container height */}
      <div
        ref={containerRef}
        className="relative flex h-[460px] sm:h-[520px] w-full items-center justify-center bg-slate-950 p-2 select-none overflow-hidden touch-none"
      >
        {/* Subtle dot matrix pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Tab 1: Interactive Crop Canvas */}
        {viewTab === 'crop' && (
          <div className="relative flex h-full w-full items-center justify-center touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={(e) => pointerStart(e.clientX, e.clientY)}
              className="touch-none cursor-crosshair rounded-lg block max-h-full max-w-full"
            />

            {/* Corner Adjustment Helper Notice */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/90 px-3.5 py-1 text-[11px] text-slate-200 border border-slate-700/80 backdrop-blur-sm shadow-lg pointer-events-none flex items-center gap-1.5">
              <Scan className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>دایره‌های گوشه را بکشید یا از کلیدهای کمکی پایین استفاده کنید</span>
            </div>

            {/* Magnifying Loupe during handle drag */}
            {loupePoint && (
              <div
                className={`absolute top-3 z-30 overflow-hidden rounded-2xl border-2 border-white/90 bg-black shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 ${
                  activeCornerIdx === 0 || activeCornerIdx === 3 ? 'left-3' : 'right-3'
                }`}
              >
                <canvas ref={loupeCanvasRef} className="h-28 w-28" />
                <div className="bg-slate-900/90 py-0.5 text-center text-[10px] text-white font-medium">
                  بزرگ‌نمایی ۲.۶ برابر
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Processed Preview */}
        {viewTab === 'preview' && (
          <div className="relative flex h-full w-full items-center justify-center p-2">
            {documentItem.processedDataUrl ? (
              <div className="relative flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={documentItem.processedDataUrl}
                  alt="پیش‌نمایش مدرک دانشگاهی"
                  className="max-h-[440px] max-w-full rounded-lg object-contain shadow-2xl border border-slate-700"
                />
                <div className="mt-2 flex items-center gap-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-300 border border-slate-700/80 backdrop-blur-sm">
                  <span>
                    ابعاد خروجی: {toPersianDigits(documentItem.processedWidth || 0)} × {toPersianDigits(documentItem.processedHeight || 0)}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-semibold">
                    صاف‌شده و آماده بارگذاری
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Sparkles className="h-8 w-8 text-emerald-500 animate-spin" />
                <p className="text-xs">در حال پردازش فیلتر و پرسپکتیو تصویر...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile-Friendly Precise Nudge Bar (D-Pad) for Corners */}
      {viewTab === 'crop' && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900/90 text-xs">
          {/* Corner selector pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <span className="text-[11px] text-slate-500 shrink-0 ml-1 font-medium">
              گوشه فعال:
            </span>
            {CORNER_NAMES.map((name, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveCornerIdx(idx)}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition shrink-0 ${
                  activeCornerIdx === idx
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* 4-way Nudge Arrows */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 ml-1 hidden xs:inline">
              تنظیم میلی‌متری:
            </span>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
              <button
                type="button"
                onClick={() => nudgeCorner(0, -3)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                title="حرکت به بالا"
                aria-label="حرکت به بالا"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => nudgeCorner(0, 3)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                title="حرکت به پایین"
                aria-label="حرکت به پایین"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => nudgeCorner(3, 0)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                title="حرکت به راست"
                aria-label="حرکت به راست"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => nudgeCorner(-3, 0)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                title="حرکت به چپ"
                aria-label="حرکت به چپ"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
