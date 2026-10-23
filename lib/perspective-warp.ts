import { Point, FourCorners } from './image-types';
import { orderCorners, getWarpDimensions, getPerspectiveTransformMatrix } from './image-math';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cv?: any;
  }
}

/**
 * Checks if OpenCV.js runtime is initialized and available
 */
export function isOpenCvReady(): boolean {
  return typeof window !== 'undefined' && !!window.cv && !!window.cv.Mat;
}

/**
 * Automatically detects document boundaries using OpenCV Canny + Contour detection
 * Returns 4 ordered points [TL, TR, BR, BL] or fallback inset if not detected.
 */
export function detectDocumentCorners(
  sourceImage: HTMLImageElement | HTMLCanvasElement
): FourCorners {
  const width = sourceImage.width;
  const height = sourceImage.height;

  // Fallback corners with 5% inset
  const defaultCorners: FourCorners = [
    { x: Math.round(width * 0.05), y: Math.round(height * 0.05) },
    { x: Math.round(width * 0.95), y: Math.round(height * 0.05) },
    { x: Math.round(width * 0.95), y: Math.round(height * 0.95) },
    { x: Math.round(width * 0.05), y: Math.round(height * 0.95) },
  ];

  if (!isOpenCvReady()) {
    return defaultCorners;
  }

  const cv = window.cv;
  let src: any = null;
  let gray: any = null;
  let blur: any = null;
  let edges: any = null;
  let kernel: any = null;
  let dilated: any = null;
  let contours: any = null;
  let hierarchy: any = null;

  try {
    src = cv.imread(sourceImage);
    gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    // Gaussian blur to remove noise
    blur = new cv.Mat();
    const ksize = new cv.Size(5, 5);
    cv.GaussianBlur(gray, blur, ksize, 0, 0, cv.BORDER_DEFAULT);

    // Canny edge detection
    edges = new cv.Mat();
    cv.Canny(blur, edges, 50, 150, 3, false);

    // Dilate slightly to close edge gaps
    kernel = cv.Mat.ones(3, 3, cv.CV_8U);
    dilated = new cv.Mat();
    cv.dilate(edges, dilated, kernel);

    contours = new cv.MatVector();
    hierarchy = new cv.Mat();
    cv.findContours(dilated, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    let maxArea = (width * height) * 0.12; // Minimum 12% of total image
    let bestQuad: Point[] | null = null;

    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);

      if (area > maxArea) {
        const peri = cv.arcLength(contour, true);
        const approx = new cv.Mat();
        cv.approxPolyDP(contour, approx, 0.025 * peri, true);

        if (approx.rows === 4) {
          const pts: Point[] = [];
          for (let p = 0; p < 4; p++) {
            pts.push({
              x: approx.data32S[p * 2],
              y: approx.data32S[p * 2 + 1],
            });
          }
          maxArea = area;
          bestQuad = pts;
        }
        approx.delete();
      }
    }

    if (bestQuad && bestQuad.length === 4) {
      return orderCorners(bestQuad);
    }
  } catch (err) {
    console.warn('OpenCV corner detection notice:', err);
  } finally {
    if (src) src.delete();
    if (gray) gray.delete();
    if (blur) blur.delete();
    if (edges) edges.delete();
    if (kernel) kernel.delete();
    if (dilated) dilated.delete();
    if (contours) contours.delete();
    if (hierarchy) hierarchy.delete();
  }

  return defaultCorners;
}

/**
 * Warps perspective from 4 corners to standard flat rectangle
 */
export function warpPerspectiveCanvas(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  corners: FourCorners
): HTMLCanvasElement {
  const ordered = orderCorners(corners);
  const dims = getWarpDimensions(ordered);
  const dstWidth = dims.width;
  const dstHeight = dims.height;

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = dstWidth;
  resultCanvas.height = dstHeight;
  const ctx = resultCanvas.getContext('2d');
  if (!ctx) return resultCanvas;

  if (isOpenCvReady()) {
    try {
      const cv = window.cv;
      const srcMat = cv.imread(sourceImage);
      const dstMat = new cv.Mat();

      // Source corners float array
      const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
        ordered[0].x, ordered[0].y, // TL
        ordered[1].x, ordered[1].y, // TR
        ordered[2].x, ordered[2].y, // BR
        ordered[3].x, ordered[3].y, // BL
      ]);

      // Dst corners float array
      const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        dstWidth, 0,
        dstWidth, dstHeight,
        0, dstHeight,
      ]);

      const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
      const dsize = new cv.Size(dstWidth, dstHeight);

      cv.warpPerspective(srcMat, dstMat, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
      cv.imshow(resultCanvas, dstMat);

      srcMat.delete();
      dstMat.delete();
      srcPoints.delete();
      dstPoints.delete();
      M.delete();

      return resultCanvas;
    } catch (e) {
      console.warn('OpenCV warp fallback to Canvas homography:', e);
    }
  }

  // Pure TypeScript / Canvas Homography Fallback
  return warpPerspectiveFallback(sourceImage, ordered, dstWidth, dstHeight);
}

/**
 * Fast pure TypeScript homography perspective warp
 */
function warpPerspectiveFallback(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  ordered: FourCorners,
  dstWidth: number,
  dstHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = dstWidth;
  canvas.height = dstHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Draw source image to temp canvas to sample pixel data
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = sourceImage.width;
  tempCanvas.height = sourceImage.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return canvas;

  tempCtx.drawImage(sourceImage, 0, 0);
  const srcImgData = tempCtx.getImageData(0, 0, sourceImage.width, sourceImage.height);
  const srcPixels = srcImgData.data;
  const sw = sourceImage.width;
  const sh = sourceImage.height;

  const dstImgData = ctx.createImageData(dstWidth, dstHeight);
  const dstPixels = dstImgData.data;

  // Matrix H mapping (x_dst, y_dst) -> (x_src, y_src)
  const H = getPerspectiveTransformMatrix(ordered, dstWidth, dstHeight);

  for (let y = 0; y < dstHeight; y++) {
    for (let x = 0; x < dstWidth; x++) {
      // Homography transform
      const denom = H[6] * x + H[7] * y + H[8];
      if (Math.abs(denom) < 1e-8) continue;

      const sx = (H[0] * x + H[1] * y + H[2]) / denom;
      const sy = (H[3] * x + H[4] * y + H[5]) / denom;

      const ix = Math.floor(sx);
      const iy = Math.floor(sy);

      if (ix >= 0 && ix < sw - 1 && iy >= 0 && iy < sh - 1) {
        // Bilinear interpolation
        const fx = sx - ix;
        const fy = sy - iy;
        const w00 = (1 - fx) * (1 - fy);
        const w01 = fx * (1 - fy);
        const w10 = (1 - fx) * fy;
        const w11 = fx * fy;

        const idx00 = (iy * sw + ix) * 4;
        const idx01 = (iy * sw + (ix + 1)) * 4;
        const idx10 = ((iy + 1) * sw + ix) * 4;
        const idx11 = ((iy + 1) * sw + (ix + 1)) * 4;

        const dstIdx = (y * dstWidth + x) * 4;

        dstPixels[dstIdx] = Math.round(
          srcPixels[idx00] * w00 + srcPixels[idx01] * w01 + srcPixels[idx10] * w10 + srcPixels[idx11] * w11
        );
        dstPixels[dstIdx + 1] = Math.round(
          srcPixels[idx00 + 1] * w00 + srcPixels[idx01 + 1] * w01 + srcPixels[idx10 + 1] * w10 + srcPixels[idx11 + 1] * w11
        );
        dstPixels[dstIdx + 2] = Math.round(
          srcPixels[idx00 + 2] * w00 + srcPixels[idx01 + 2] * w01 + srcPixels[idx10 + 2] * w10 + srcPixels[idx11 + 2] * w11
        );
        dstPixels[dstIdx + 3] = 255;
      }
    }
  }

  ctx.putImageData(dstImgData, 0, 0);
  return canvas;
}
