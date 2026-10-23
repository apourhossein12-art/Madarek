'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import DocumentQueue from '@/components/DocumentQueue';
import ScannerViewport from '@/components/ScannerViewport';
import FilterControls from '@/components/FilterControls';
import CompressionPanel from '@/components/CompressionPanel';
import UniversityGuideModal from '@/components/UniversityGuideModal';
import SaveModal from '@/components/SaveModal';
import {
  DocumentItem,
  DocumentAdjustment,
  FourCorners,
  UniversityPreset,
} from '@/lib/image-types';
import { classifyDocumentType } from '@/lib/image-math';
import { isOpenCvReady, detectDocumentCorners, warpPerspectiveCanvas } from '@/lib/perspective-warp';
import { applyDocumentFilters } from '@/lib/image-filters';
import { compressCanvasToTargetKb } from '@/lib/compressor';
import { createSampleDegreeCertificate } from '@/lib/sample-docs';

export default function DocumentScannerPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isOpenCvLoaded, setIsOpenCvLoaded] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [viewTab, setViewTab] = useState<'crop' | 'preview'>('crop');
  const [isProcessing, setIsProcessing] = useState(false);

  // Queue of documents
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  // Check OpenCV ready status periodically until loaded
  useEffect(() => {
    const checkCv = () => {
      if (isOpenCvReady()) {
        setIsOpenCvLoaded(true);
      }
    };
    checkCv();
    const interval = setInterval(checkCv, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync dark/light mode class and localStorage
  const applyTheme = (isDark: boolean) => {
    setDarkMode(isDark);
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('docscan_theme');
    // Default to clean light mode unless dark explicitly saved
    const isDark = savedTheme === 'dark';
    applyTheme(isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    applyTheme(next);
    localStorage.setItem('docscan_theme', next ? 'dark' : 'light');
  };

  // Initialize with realistic sample document on first visit
  useEffect(() => {
    if (documents.length === 0) {
      const sampleUrl = createSampleDegreeCertificate();
      const img = new Image();
      img.src = sampleUrl;
      img.onload = () => {
        const id = 'doc_' + Date.now();
        const initialCorners: FourCorners = [
          { x: 120, y: 140 },
          { x: 1080, y: 80 },
          { x: 1120, y: 1460 },
          { x: 160, y: 1520 },
        ];

        const initialDoc: DocumentItem = {
          id,
          name: 'گواهی موقت دانشگاهی (نمونه)',
          originalDataUrl: sampleUrl,
          sourceWidth: img.width,
          sourceHeight: img.height,
          detectedType: 'a4_document',
          adjustments: {
            rotation: 0,
            flipHorizontal: false,
            filterMode: 'official_doc',
            brightness: 0,
            contrast: 10,
            shadowRemoval: true,
            sharpen: true,
            targetMaxKb: 512,
            cropCorners: initialCorners,
          },
          createdAt: Date.now(),
        };

        setDocuments([initialDoc]);
        setActiveDocId(id);
      };
    }
  }, [documents.length]);

  // Current active document
  const activeDocument = documents.find((d) => d.id === activeDocId) || documents[0] || null;

  // Processing pipeline
  const processTimerRef = useRef<NodeJS.Timeout | null>(null);

  const runProcessing = useCallback(async (doc: DocumentItem) => {
    if (!doc || !doc.originalDataUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = doc.originalDataUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      // 1. Handle rotation/flip if present
      const rot = doc.adjustments.rotation || 0;
      const flip = doc.adjustments.flipHorizontal || false;

      let orientedCanvas = document.createElement('canvas');
      if (rot % 180 !== 0) {
        orientedCanvas.width = img.height;
        orientedCanvas.height = img.width;
      } else {
        orientedCanvas.width = img.width;
        orientedCanvas.height = img.height;
      }
      const oCtx = orientedCanvas.getContext('2d');
      if (oCtx) {
        oCtx.save();
        oCtx.translate(orientedCanvas.width / 2, orientedCanvas.height / 2);
        oCtx.rotate((rot * Math.PI) / 180);
        if (flip) oCtx.scale(-1, 1);
        oCtx.drawImage(img, -img.width / 2, -img.height / 2);
        oCtx.restore();
      }

      // 2. Perspective warp
      const corners = doc.adjustments.cropCorners || [
        { x: 0, y: 0 },
        { x: orientedCanvas.width, y: 0 },
        { x: orientedCanvas.width, y: orientedCanvas.height },
        { x: 0, y: orientedCanvas.height },
      ];

      const warpedCanvas = warpPerspectiveCanvas(orientedCanvas, corners);

      // 3. Document Filters
      const fCtx = warpedCanvas.getContext('2d');
      if (fCtx) {
        applyDocumentFilters(
          fCtx,
          warpedCanvas.width,
          warpedCanvas.height,
          doc.adjustments.filterMode,
          {
            brightness: doc.adjustments.brightness,
            contrast: doc.adjustments.contrast,
            shadowRemoval: doc.adjustments.shadowRemoval,
            sharpen: doc.adjustments.sharpen,
          }
        );
      }

      // 4. Strict Binary Search Compression for University Limit
      const targetKb = doc.adjustments.targetMaxKb || 512;
      const compResult = await compressCanvasToTargetKb(warpedCanvas, targetKb);

      // 5. Update state
      setDocuments((prev) =>
        prev.map((item) =>
          item.id === doc.id
            ? {
                ...item,
                processedBlob: compResult.blob,
                processedDataUrl: compResult.dataUrl,
                processedBytes: compResult.bytes,
                processedWidth: compResult.width,
                processedHeight: compResult.height,
              }
            : item
        )
      );
    } catch (err) {
      console.error('Error during image processing:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Trigger processing when active doc adjustments change (debounced)
  useEffect(() => {
    if (!activeDocument) return;

    if (processTimerRef.current) {
      clearTimeout(processTimerRef.current);
    }

    processTimerRef.current = setTimeout(() => {
      runProcessing(activeDocument);
    }, 150);

    return () => {
      if (processTimerRef.current) clearTimeout(processTimerRef.current);
    };
  }, [
    activeDocument?.adjustments.filterMode,
    activeDocument?.adjustments.brightness,
    activeDocument?.adjustments.contrast,
    activeDocument?.adjustments.shadowRemoval,
    activeDocument?.adjustments.sharpen,
    activeDocument?.adjustments.targetMaxKb,
    activeDocument?.adjustments.rotation,
    activeDocument?.adjustments.flipHorizontal,
    activeDocument?.adjustments.cropCorners,
    runProcessing,
  ]);

  // Adjustments update handler
  const handleUpdateAdjustments = (updated: Partial<DocumentAdjustment>) => {
    if (!activeDocId) return;
    setDocuments((prev) =>
      prev.map((item) =>
        item.id === activeDocId
          ? {
              ...item,
              adjustments: { ...item.adjustments, ...updated },
            }
          : item
      )
    );
  };

  // Corner coordinates update handler
  const handleUpdateCorners = (corners: FourCorners) => {
    handleUpdateAdjustments({ cropCorners: corners });
  };

  // Rotation handler
  const handleRotate = (dir: 'cw' | 'ccw') => {
    if (!activeDocument) return;
    const currentRot = activeDocument.adjustments.rotation || 0;
    const delta = dir === 'cw' ? 90 : -90;
    const nextRot = (currentRot + delta + 360) % 360;
    handleUpdateAdjustments({ rotation: nextRot });
  };

  // Flip handler
  const handleFlip = () => {
    if (!activeDocument) return;
    handleUpdateAdjustments({
      flipHorizontal: !activeDocument.adjustments.flipHorizontal,
    });
  };

  // Add document from uploaded file
  const handleAddDocument = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const id = 'doc_' + Date.now();
        const detectedType = classifyDocumentType(img.width, img.height);

        // Best filter mode suggestion based on document type
        let suggestedFilter: DocumentAdjustment['filterMode'] = 'enhanced_color';
        let suggestedKb = 512;

        if (detectedType === 'photo_3x4') {
          suggestedFilter = 'photo_3x4';
          suggestedKb = 35; // strict 35 KB for 3x4 photo
        } else if (detectedType === 'id_card') {
          suggestedFilter = 'official_doc';
          suggestedKb = 512;
        } else {
          suggestedFilter = 'official_doc';
          suggestedKb = 512;
        }

        // Auto detect corners
        const corners = detectDocumentCorners(img);

        const newDoc: DocumentItem = {
          id,
          name: file.name.replace(/\.[^/.]+$/, '') || 'مدرک جدید',
          originalDataUrl: dataUrl,
          sourceWidth: img.width,
          sourceHeight: img.height,
          detectedType,
          adjustments: {
            rotation: 0,
            flipHorizontal: false,
            filterMode: suggestedFilter,
            brightness: 0,
            contrast: 10,
            shadowRemoval: true,
            sharpen: true,
            targetMaxKb: suggestedKb,
            cropCorners: corners,
          },
          createdAt: Date.now(),
        };

        setDocuments((prev) => [...prev, newDoc]);
        setActiveDocId(id);
      };
    };
    reader.readAsDataURL(file);
  };

  // Add sample document from DataURL
  const handleAddDataUrl = (dataUrl: string, name: string) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const id = 'doc_' + Date.now();
      const detectedType = classifyDocumentType(img.width, img.height);
      const corners = detectDocumentCorners(img);

      const newDoc: DocumentItem = {
        id,
        name,
        originalDataUrl: dataUrl,
        sourceWidth: img.width,
        sourceHeight: img.height,
        detectedType,
        adjustments: {
          rotation: 0,
          flipHorizontal: false,
          filterMode: detectedType === 'photo_3x4' ? 'photo_3x4' : 'official_doc',
          brightness: 0,
          contrast: 10,
          shadowRemoval: true,
          sharpen: true,
          targetMaxKb: detectedType === 'photo_3x4' ? 35 : 512,
          cropCorners: corners,
        },
        createdAt: Date.now(),
      };

      setDocuments((prev) => [...prev, newDoc]);
      setActiveDocId(id);
    };
  };

  // Delete document
  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      if (activeDocId === id && filtered.length > 0) {
        setActiveDocId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Apply university preset
  const handleApplyPreset = (preset: UniversityPreset) => {
    handleUpdateAdjustments({
      targetMaxKb: preset.maxKb,
      filterMode: preset.targetFilter,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/70 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenGuide={() => setGuideModalOpen(true)}
        isOpenCvLoaded={isOpenCvLoaded}
      />

      {/* Main Workspace Layout */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-3 sm:p-5">
        {/* Document Batch Queue Bar */}
        <DocumentQueue
          documents={documents}
          activeDocId={activeDocId}
          onSelectDoc={(id) => setActiveDocId(id)}
          onAddDocument={handleAddDocument}
          onAddDataUrl={handleAddDataUrl}
          onDeleteDoc={handleDeleteDoc}
        />

        {/* Workspace: 2-Column Grid on Desktop */}
        {activeDocument && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
            {/* Left/Center Column: Viewport (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3">
              <ScannerViewport
                documentItem={activeDocument}
                viewTab={viewTab}
                onChangeViewTab={setViewTab}
                onUpdateCorners={handleUpdateCorners}
                onRotate={handleRotate}
                onFlip={handleFlip}
                isOpenCvReady={isOpenCvLoaded}
              />
            </div>

            {/* Right Column: Controls & Compression (4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
              {/* Output Mode & Filters */}
              <FilterControls
                adjustments={activeDocument.adjustments}
                onChangeAdjustments={handleUpdateAdjustments}
              />

              {/* Exact File Size Compression & Download */}
              <CompressionPanel
                documentItem={activeDocument}
                targetMaxKb={activeDocument.adjustments.targetMaxKb}
                onChangeTargetKb={(kb) => handleUpdateAdjustments({ targetMaxKb: kb })}
                onApplyPreset={handleApplyPreset}
                onPrepareForSave={() => setSaveModalOpen(true)}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        )}
      </main>

      {/* University Rules Guide Modal */}
      <UniversityGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />

      {/* High-Res Save & Mobile Long Press Modal */}
      {activeDocument && (
        <SaveModal
          isOpen={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          documentItem={activeDocument}
        />
      )}
    </div>
  );
}
