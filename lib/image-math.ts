import { Point, FourCorners } from './image-types';

/**
 * Calculates Euclidean distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.hypot(dx, dy);
}

/**
 * Orders 4 arbitrary points into standard:
 * [Top-Left, Top-Right, Bottom-Right, Bottom-Left]
 */
export function orderCorners(pts: Point[]): FourCorners {
  if (pts.length !== 4) {
    throw new Error('Exactly 4 points are required');
  }

  // 1. Sort points by y coordinate (ascending)
  const sortedByY = [...pts].sort((a, b) => a.y - b.y);

  // Top two points will have smaller y coordinates
  const topTwo = sortedByY.slice(0, 2).sort((a, b) => a.x - b.x);
  const tl = topTwo[0];
  const tr = topTwo[1];

  // Bottom two points will have larger y coordinates
  const bottomTwo = sortedByY.slice(2, 4).sort((a, b) => a.x - b.x);
  const bl = bottomTwo[0];
  const br = bottomTwo[1];

  return [tl, tr, br, bl];
}

/**
 * Calculates target rectangle width and height from 4 corners
 */
export function getWarpDimensions(corners: FourCorners): { width: number; height: number } {
  const [tl, tr, br, bl] = corners;

  const widthTop = distance(tl, tr);
  const widthBottom = distance(bl, br);
  const maxWidth = Math.max(widthTop, widthBottom);

  const heightLeft = distance(tl, bl);
  const heightRight = distance(tr, br);
  const maxHeight = Math.max(heightLeft, heightRight);

  return {
    width: Math.max(10, Math.round(maxWidth)),
    height: Math.max(10, Math.round(maxHeight)),
  };
}

/**
 * Computes polygon area of 4 corners using Shoelace formula
 */
export function polygonArea(corners: FourCorners): number {
  const [p0, p1, p2, p3] = corners;
  return Math.abs(
    (p0.x * p1.y - p1.x * p0.y) +
    (p1.x * p2.y - p2.x * p1.y) +
    (p2.x * p3.y - p3.x * p2.y) +
    (p3.x * p0.y - p0.x * p3.y)
  ) / 2;
}

/**
 * Classifies document type from aspect ratio and dimensions
 */
export function classifyDocumentType(
  width: number,
  height: number
): 'photo_3x4' | 'id_card' | 'a4_document' | 'custom' {
  if (width <= 0 || height <= 0) return 'custom';
  const ratio = width / height;

  // 3x4 photo: portrait with ratio around 0.75 (0.65 to 0.85)
  if (ratio >= 0.65 && ratio <= 0.85 && width < 1200 && height < 1600) {
    return 'photo_3x4';
  }

  // ID Card (کارت ملی هوشمند): landscape with aspect ratio ~ 1.58 (1.45 to 1.75)
  if (ratio >= 1.45 && ratio <= 1.75) {
    return 'id_card';
  }

  // A4 Document / Certificate: portrait ratio ~ 0.707 (or inverted 1.41)
  if ((ratio >= 0.68 && ratio <= 0.74) || (ratio >= 1.35 && ratio <= 1.45)) {
    return 'a4_document';
  }

  return 'custom';
}

/**
 * Computes 3x3 Homography Matrix mapping source quadrilateral to destination rectangle
 * Solves system of 8 linear equations.
 */
export function getPerspectiveTransformMatrix(
  src: FourCorners,
  dstWidth: number,
  dstHeight: number
): number[] {
  // src: [tl, tr, br, bl]
  // dst: (0,0), (dstWidth,0), (dstWidth,dstHeight), (0,dstHeight)
  const [s0, s1, s2, s3] = src;
  const d0 = { x: 0, y: 0 };
  const d1 = { x: dstWidth, y: 0 };
  const d2 = { x: dstWidth, y: dstHeight };
  const d3 = { x: 0, y: dstHeight };

  // Solve Ah = b or standard 4-point projectivity
  const A: number[][] = [];
  const b: number[] = [];

  const pairs: [Point, Point][] = [
    [d0, s0],
    [d1, s1],
    [d2, s2],
    [d3, s3],
  ];

  for (let i = 0; i < 4; i++) {
    const [d, s] = pairs[i];
    A.push([d.x, d.y, 1, 0, 0, 0, -d.x * s.x, -d.y * s.x]);
    b.push(s.x);
    A.push([0, 0, 0, d.x, d.y, 1, -d.x * s.y, -d.y * s.y]);
    b.push(s.y);
  }

  // Gaussian elimination to solve 8x8 system
  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    const tempA = A[i];
    A[i] = A[maxRow];
    A[maxRow] = tempA;
    const tempB = b[i];
    b[i] = b[maxRow];
    b[maxRow] = tempB;

    if (Math.abs(A[i][i]) < 1e-10) {
      // Degenerate quad, fallback identity
      return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    }

    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
      b[k] -= factor * b[i];
    }
  }

  const h: number[] = new Array(8);
  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i];
    for (let j = i + 1; j < n; j++) {
      sum -= A[i][j] * h[j];
    }
    h[i] = sum / A[i][i];
  }

  // [h0, h1, h2, h3, h4, h5, h6, h7, 1]
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

/**
 * Format bytes to readable Persian string (e.g. ۳۲.۵ KB)
 */
export function formatBytesFa(bytes: number): string {
  if (bytes < 1024) {
    return `${toPersianDigits(bytes)} بایت`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${toPersianDigits(kb.toFixed(1))} KB`;
  }
  const mb = kb / 1024;
  return `${toPersianDigits(mb.toFixed(2))} MB`;
}

export function toPersianDigits(str: string | number): string {
  return String(str);
}
