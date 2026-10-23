/**
 * Smart Iterative JPEG Compression Algorithm with strict target byte ceiling
 * Specially designed for Iranian university admissions (paziresh.azmoon.iau.ir, Sanjesh, Golestan)
 */

export interface CompressionResult {
  blob: Blob;
  dataUrl: string;
  bytes: number;
  width: number;
  height: number;
  finalQuality: number;
}

/**
 * Compresses an HTMLCanvasElement or ImageBitmap to JPEG strictly below maxBytes
 */
export async function compressCanvasToTargetKb(
  sourceCanvas: HTMLCanvasElement,
  targetMaxKb: number,
  mimeType: 'image/jpeg' = 'image/jpeg'
): Promise<CompressionResult> {
  const targetMaxBytes = Math.floor(targetMaxKb * 1024);
  let currentWidth = sourceCanvas.width;
  let currentHeight = sourceCanvas.height;

  let workingCanvas = sourceCanvas;
  let needsResize = false;

  // Binary search quality range
  let bestBlob: Blob | null = null;
  let bestBytes = Infinity;
  let bestQuality = 0.85;

  // Maximum 5 dimension downscaling iterations if file is huge
  for (let resizeIter = 0; resizeIter < 5; resizeIter++) {
    if (needsResize) {
      const scale = 0.85;
      currentWidth = Math.max(100, Math.round(currentWidth * scale));
      currentHeight = Math.max(100, Math.round(currentHeight * scale));

      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = currentWidth;
      scaledCanvas.height = currentHeight;
      const ctx = scaledCanvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(sourceCanvas, 0, 0, currentWidth, currentHeight);
      }
      workingCanvas = scaledCanvas;
    }

    // Binary search quality between 0.1 and 0.98
    let lowQ = 0.1;
    let highQ = 0.98;
    let foundValidAtThisScale = false;

    for (let qIter = 0; qIter < 7; qIter++) {
      const midQ = (lowQ + highQ) / 2;
      const blob = await canvasToBlob(workingCanvas, mimeType, midQ);
      if (!blob) break;

      const size = blob.size;

      if (size <= targetMaxBytes) {
        // Valid candidate! Try higher quality
        bestBlob = blob;
        bestBytes = size;
        bestQuality = midQ;
        foundValidAtThisScale = true;
        lowQ = midQ; // see if we can get better quality
      } else {
        // Too large, decrease quality
        highQ = midQ;
      }
    }

    // If we found a valid compression strictly under targetMaxBytes, we are done!
    if (foundValidAtThisScale && bestBlob && bestBlob.size <= targetMaxBytes) {
      break;
    }

    // If even quality 0.10 was over targetMaxBytes, we must downscale dimensions
    needsResize = true;
  }

  // Safety fallback if image couldn't meet target (extremely small KB like 10KB)
  if (!bestBlob || bestBytes > targetMaxBytes) {
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = Math.min(workingCanvas.width, 400);
    fallbackCanvas.height = Math.round(workingCanvas.height * (fallbackCanvas.width / workingCanvas.width));
    const ctx = fallbackCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(workingCanvas, 0, 0, fallbackCanvas.width, fallbackCanvas.height);
    }
    bestBlob = (await canvasToBlob(fallbackCanvas, mimeType, 0.4)) || (await canvasToBlob(workingCanvas, mimeType, 0.1))!;
    bestBytes = bestBlob ? bestBlob.size : 0;
    workingCanvas = fallbackCanvas;
  }

  const dataUrl = await blobToDataUrl(bestBlob);

  return {
    blob: bestBlob,
    dataUrl,
    bytes: bestBlob.size,
    width: workingCanvas.width,
    height: workingCanvas.height,
    finalQuality: Math.round(bestQuality * 100) / 100,
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), mimeType, quality);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
