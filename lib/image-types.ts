export interface Point {
  x: number;
  y: number;
}

export type FourCorners = [Point, Point, Point, Point]; // [TL, TR, BR, BL]

export type FilterMode =
  | 'official_doc'   // سند رسمی با حفظ رنگ مهر و امضا و پس‌زمینه سفید
  | 'transcript'     // کارنامه و ریز نمرات (تقویت خطوط جدول و خوانایی نمرات کم‌رنگ)
  | 'enhanced_color' // رنگی بهبودیافته با کنتراست و بالانس سفید
  | 'bw_text'        // سیاه و سفید متنی برای خوانایی حداکثری
  | 'photo_3x4'      // عکس پرسنلی ۳×۴
  | 'natural';       // طبیعی / بدون افکت شدید

export interface DocumentAdjustment {
  rotation: number; // 0, 90, 180, 270
  flipHorizontal: boolean;
  filterMode: FilterMode;
  brightness: number; // -50 to +50
  contrast: number;   // -50 to +50
  shadowRemoval: boolean;
  sharpen: boolean;
  targetMaxKb: number; // e.g. 35, 512
  cropCorners?: FourCorners; // in source image coordinates
}

export interface DocumentItem {
  id: string;
  name: string;
  originalDataUrl: string;
  sourceWidth: number;
  sourceHeight: number;
  detectedType: 'a4_document' | 'id_card' | 'photo_3x4' | 'custom';
  adjustments: DocumentAdjustment;
  processedBlob?: Blob;
  processedDataUrl?: string;
  processedWidth?: number;
  processedHeight?: number;
  processedBytes?: number;
  createdAt: number;
}

export interface UniversityPreset {
  id: string;
  title: string;
  portalName: string;
  maxKb: number;
  targetFilter: FilterMode;
  recommendedDimensions: string;
  badgeColor: string;
  description: string;
}
