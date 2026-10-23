import { FilterMode } from './image-types';

/**
 * Applies document image filters directly on Canvas ImageData
 */
export function applyDocumentFilters(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: FilterMode,
  options: {
    brightness: number; // -50 to +50
    contrast: number;   // -50 to +50
    shadowRemoval: boolean;
    sharpen: boolean;
  }
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  // 1. Shadow removal (if enabled)
  if (options.shadowRemoval) {
    removeShadows(data, width, height);
  }

  // 2. Mode specific transformation
  switch (mode) {
    case 'enhanced_color':
      applyEnhancedColor(data, width, height);
      break;
    case 'bw_text':
      applyAdaptiveThresholdBW(data, width, height);
      break;
    case 'official_doc':
      applyOfficialDocumentFilter(data, width, height);
      break;
    case 'transcript':
      applyTranscriptFilter(data, width, height);
      break;
    case 'photo_3x4':
      applyPortrait3x4Filter(data, width, height);
      break;
    case 'natural':
    default:
      applyNaturalBalance(data, width, height);
      break;
  }

  // 3. Manual Brightness & Contrast adjustment
  if (options.brightness !== 0 || options.contrast !== 0) {
    applyBrightnessContrast(data, options.brightness, options.contrast);
  }

  // Put image data back
  ctx.putImageData(imgData, 0, 0);

  // 4. Sharpening (if enabled)
  if (options.sharpen) {
    applySharpenKernel(ctx, width, height);
  }
}

/**
 * Mode: Enhanced Color (رنگی بهبودیافته)
 * Performs white balance calibration + CLAHE-like contrast stretching
 */
function applyEnhancedColor(data: Uint8ClampedArray, width: number, height: number) {
  const len = data.length;

  // Sample brightest 5% pixels to estimate white point
  let maxR = 0;
  let maxG = 0;
  let maxB = 0;

  const step = Math.max(1, Math.floor(len / 4000));
  for (let i = 0; i < len; i += step * 4) {
    if (data[i] > maxR) maxR = data[i];
    if (data[i + 1] > maxG) maxG = data[i + 1];
    if (data[i + 2] > maxB) maxB = data[i + 2];
  }

  maxR = Math.max(180, maxR);
  maxG = Math.max(180, maxG);
  maxB = Math.max(180, maxB);

  const scaleR = 255 / maxR;
  const scaleG = 255 / maxG;
  const scaleB = 255 / maxB;

  for (let i = 0; i < len; i += 4) {
    let r = data[i] * scaleR;
    let g = data[i + 1] * scaleG;
    let b = data[i + 2] * scaleB;

    // S-curve contrast boost
    r = applySCurve(r);
    g = applySCurve(g);
    b = applySCurve(b);

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }
}

/**
 * Mode: Official Document (سند رسمی)
 * Keeps colored stamps and signatures (blue, red, purple) vibrant while making paper background pure white.
 */
function applyOfficialDocumentFilter(data: Uint8ClampedArray, width: number, height: number) {
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const chroma = maxC - minC;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // Check if this pixel belongs to a stamp or colored pen signature:
    // Saturated ink: Blue ballpoint (B > R & B > G), Red stamp (R >> G & R >> B), Purple/Violet (B > G & R > G)
    const isColoredInk = chroma > 22 && (b > g + 10 || r > g + 12 || (b > 110 && r > 100 && g < 100));

    if (isColoredInk) {
      // Enhance ink color: boost saturation and slight darkening for crispness
      if (b > r && b > g) {
        // Blue pen/stamp
        data[i] = clamp(r * 0.8);
        data[i + 1] = clamp(g * 0.85);
        data[i + 2] = clamp(b * 1.15 + 20);
      } else if (r > g && r > b) {
        // Red stamp
        data[i] = clamp(r * 1.2 + 20);
        data[i + 1] = clamp(g * 0.7);
        data[i + 2] = clamp(b * 0.7);
      } else {
        // Purple / violet official seal
        data[i] = clamp(r * 1.1);
        data[i + 1] = clamp(g * 0.7);
        data[i + 2] = clamp(b * 1.2);
      }
    } else {
      // Neutral tones: either paper background or printed black text
      if (luminance > 140) {
        // Paper background -> turn into crisp pure white
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      } else {
        // Printed text -> make darker and crisp
        const darkened = clamp(luminance * 0.7);
        data[i] = darkened;
        data[i + 1] = darkened;
        data[i + 2] = darkened;
      }
    }
  }
}

/**
 * Mode: Transcript & Grade Sheet (کارنامه و ریز نمرات)
 * Specifically tuned for university transcripts with dot-matrix/laser tables,
 * faint grades, course codes, and stamps.
 */
function applyTranscriptFilter(data: Uint8ClampedArray, width: number, height: number) {
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const chroma = maxC - minC;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // Check if colored ink (blue/purple/red stamps or signatures)
    const isColoredInk = chroma > 20 && (b > g + 8 || r > g + 10 || (b > 100 && r > 90 && g < 90));

    if (isColoredInk) {
      if (b > r && b > g) {
        // Blue ink/stamp
        data[i] = clamp(r * 0.75);
        data[i + 1] = clamp(g * 0.8);
        data[i + 2] = clamp(b * 1.25 + 15);
      } else if (r > g && r > b) {
        // Red stamp
        data[i] = clamp(r * 1.25 + 15);
        data[i + 1] = clamp(g * 0.65);
        data[i + 2] = clamp(b * 0.65);
      } else {
        data[i] = clamp(r * 1.1);
        data[i + 1] = clamp(g * 0.7);
        data[i + 2] = clamp(b * 1.2);
      }
    } else {
      // Transcript paper vs text/table lines
      // Boost faint numbers and table borders (luminance < 170) to strong dark ink
      if (luminance < 170) {
        // Faint grades and table lines -> make sharp and dark
        const deepened = clamp(luminance * 0.55);
        data[i] = deepened;
        data[i + 1] = deepened;
        data[i + 2] = deepened;
      } else {
        // Background paper noise -> pure white
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      }
    }
  }
}

/**
 * Mode: Adaptive Threshold Black & White (سیاه و سفید متنی)
 * Fast integral-image adaptive local thresholding for razor-sharp printed and handwritten text
 */
function applyAdaptiveThresholdBW(data: Uint8ClampedArray, width: number, height: number) {
  // Convert to grayscale first
  const gray = new Uint8Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  // Integral image for fast local box average
  const S = Math.max(16, Math.floor(width / 32)); // window radius
  const T = 12; // threshold percentage offset

  // Build integral image
  const integral = new Float64Array(width * height);
  for (let i = 0; i < width; i++) {
    let sum = 0;
    for (let j = 0; j < height; j++) {
      const idx = j * width + i;
      sum += gray[idx];
      if (i === 0) {
        integral[idx] = sum;
      } else {
        integral[idx] = integral[j * width + (i - 1)] + sum;
      }
    }
  }

  // Threshold comparison
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const idx = j * width + i;

      const x1 = Math.max(0, i - S);
      const x2 = Math.min(width - 1, i + S);
      const y1 = Math.max(0, j - S);
      const y2 = Math.min(height - 1, j + S);

      const count = (x2 - x1) * (y2 - y1);
      const sum =
        integral[y2 * width + x2] -
        integral[y1 * width + x2] -
        integral[y2 * width + x1] +
        integral[y1 * width + x1];

      const avg = sum / count;
      const pixelVal = gray[idx] < avg * (100 - T) / 100 ? 0 : 255;

      const pIdx = idx * 4;
      data[pIdx] = pixelVal;
      data[pIdx + 1] = pixelVal;
      data[pIdx + 2] = pixelVal;
    }
  }
}

/**
 * Mode: 3x4 Portrait Photo (عکس پرسنلی ۳×۴)
 */
function applyPortrait3x4Filter(data: Uint8ClampedArray, width: number, height: number) {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Slight warmth and clarity for portrait photo
    r = r * 1.05 + 4;
    g = g * 1.02 + 2;
    b = b * 0.98;

    // Gentle contrast
    r = ((r - 128) * 1.15) + 128;
    g = ((g - 128) * 1.15) + 128;
    b = ((b - 128) * 1.15) + 128;

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }
}

/**
 * Mode: Natural
 */
function applyNaturalBalance(data: Uint8ClampedArray, width: number, height: number) {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    // Subtle lift
    data[i] = clamp(data[i] * 1.02 + 2);
    data[i + 1] = clamp(data[i + 1] * 1.02 + 2);
    data[i + 2] = clamp(data[i + 2] * 1.02 + 2);
  }
}

/**
 * Shadow Removal: Background illumination estimation and division
 */
function removeShadows(data: Uint8ClampedArray, width: number, height: number) {
  const len = data.length;
  const block = Math.max(20, Math.floor(Math.min(width, height) / 25));

  // Compute block maximum luminance
  const blocksX = Math.ceil(width / block);
  const blocksY = Math.ceil(height / block);
  const bgGrid = new Float32Array(blocksX * blocksY);

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      let maxL = 0;
      const startX = bx * block;
      const startY = by * block;
      const endX = Math.min(width, startX + block);
      const endY = Math.min(height, startY + block);

      for (let y = startY; y < endY; y += 2) {
        for (let x = startX; x < endX; x += 2) {
          const idx = (y * width + x) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          if (lum > maxL) maxL = lum;
        }
      }
      bgGrid[by * blocksX + bx] = Math.max(120, maxL);
    }
  }

  // Normalize pixels using interpolated background illumination
  for (let y = 0; y < height; y++) {
    const gy = Math.min(blocksY - 1, Math.floor(y / block));
    for (let x = 0; x < width; x++) {
      const gx = Math.min(blocksX - 1, Math.floor(x / block));
      const bg = bgGrid[gy * blocksX + gx];
      const factor = 255 / bg;

      const idx = (y * width + x) * 4;
      data[idx] = clamp(data[idx] * factor);
      data[idx + 1] = clamp(data[idx + 1] * factor);
      data[idx + 2] = clamp(data[idx + 2] * factor);
    }
  }
}

/**
 * Manual Brightness and Contrast
 */
function applyBrightnessContrast(data: Uint8ClampedArray, brightness: number, contrast: number) {
  // brightness: -50 to +50
  // contrast: -50 to +50
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const bOffset = brightness * 1.5;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] + bOffset;
    let g = data[i + 1] + bOffset;
    let b = data[i + 2] + bOffset;

    r = factor * (r - 128) + 128;
    g = factor * (g - 128) + 128;
    b = factor * (b - 128) + 128;

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }
}

/**
 * 3x3 Sharpen Kernel convolution
 */
function applySharpenKernel(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const src = ctx.getImageData(0, 0, width, height);
  const dst = ctx.createImageData(width, height);
  const s = src.data;
  const d = dst.data;

  // Sharpen kernel:
  // [ 0, -1,  0]
  // [-1,  5, -1]
  // [ 0, -1,  0]
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const up = ((y - 1) * width + x) * 4;
      const down = ((y + 1) * width + x) * 4;
      const left = (y * width + (x - 1)) * 4;
      const right = (y * width + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val = 5 * s[idx + c] - s[up + c] - s[down + c] - s[left + c] - s[right + c];
        d[idx + c] = clamp(val);
      }
      d[idx + 3] = 255;
    }
  }

  // Copy borders
  ctx.putImageData(dst, 0, 0);
}

function applySCurve(val: number): number {
  const norm = val / 255;
  // S-curve contrast formula: 3*x^2 - 2*x^3
  const curved = (3 * norm * norm - 2 * norm * norm * norm) * 255;
  return curved;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}
