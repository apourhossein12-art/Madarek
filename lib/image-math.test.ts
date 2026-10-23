import test from 'node:test';
import assert from 'node:assert/strict';
import {
  distance,
  orderCorners,
  getWarpDimensions,
  polygonArea,
  classifyDocumentType,
  getPerspectiveTransformMatrix,
  toPersianDigits,
  formatBytesFa,
} from './image-math';
import { Point } from './image-types';

test('distance calculates Euclidean distance correctly', () => {
  const p1: Point = { x: 0, y: 0 };
  const p2: Point = { x: 3, y: 4 };
  assert.equal(distance(p1, p2), 5);
});

test('orderCorners correctly orders arbitrary points into [TL, TR, BR, BL]', () => {
  // Input in mixed order
  const rawPoints: Point[] = [
    { x: 100, y: 200 }, // BR
    { x: 10, y: 20 },   // TL
    { x: 95, y: 25 },   // TR
    { x: 15, y: 195 },  // BL
  ];

  const [tl, tr, br, bl] = orderCorners(rawPoints);
  assert.equal(tl.x, 10);
  assert.equal(tl.y, 20);
  assert.equal(tr.x, 95);
  assert.equal(tr.y, 25);
  assert.equal(br.x, 100);
  assert.equal(br.y, 200);
  assert.equal(bl.x, 15);
  assert.equal(bl.y, 195);
});

test('getWarpDimensions calculates correct bounding dimensions', () => {
  const corners = orderCorners([
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 150 },
    { x: 0, y: 150 },
  ]);

  const dims = getWarpDimensions(corners);
  assert.equal(dims.width, 100);
  assert.equal(dims.height, 150);
});

test('polygonArea calculates accurate area for standard rectangle', () => {
  const corners = orderCorners([
    { x: 0, y: 0 },
    { x: 200, y: 0 },
    { x: 200, y: 300 },
    { x: 0, y: 300 },
  ]);

  const area = polygonArea(corners);
  assert.equal(area, 60000);
});

test('classifyDocumentType identifies document types accurately', () => {
  // 3x4 photo (300 x 400 = 0.75 ratio)
  assert.equal(classifyDocumentType(300, 400), 'photo_3x4');

  // Iranian ID card (e.g. 856 x 540 = 1.585 ratio)
  assert.equal(classifyDocumentType(856, 540), 'id_card');

  // A4 Document (e.g. 1240 x 1754 = 0.706 ratio)
  assert.equal(classifyDocumentType(1240, 1754), 'a4_document');
});

test('toPersianDigits and formatBytesFa converts numbers correctly', () => {
  assert.equal(toPersianDigits('12345'), '12345');
  assert.equal(formatBytesFa(35 * 1024), '35.0 KB');
});

test('getPerspectiveTransformMatrix returns valid 9-element homography vector', () => {
  const corners = orderCorners([
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ]);

  const H = getPerspectiveTransformMatrix(corners, 100, 100);
  assert.equal(H.length, 9);
  // Identity matrix on straight square
  assert.ok(Math.abs(H[0] - 1) < 0.01);
  assert.ok(Math.abs(H[4] - 1) < 0.01);
  assert.ok(Math.abs(H[8] - 1) < 0.01);
});
