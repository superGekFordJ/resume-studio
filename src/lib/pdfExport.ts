'use client';

/**
 * Check if the current browser supports the required features
 */
export function isPDFExportSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.print === 'function' &&
    typeof window.open === 'function'
  );
}

/**
 * Get estimated file size for PDF export
 */
export function estimatePDFSize(): string {
  return 'Vector PDF (~50-100 KB)';
}
