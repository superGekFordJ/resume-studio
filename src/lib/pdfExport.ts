"use client";

import type { ResumeData } from '@/types/resume';

interface ExportOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

/**
 * Export resume to PDF using browser's native print API for vector output
 */
export async function exportResumeToPDF(
  resumeData: ResumeData, 
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = `${resumeData.personalDetails.fullName.replace(/\s+/g, '_')}_Resume.pdf`
  } = options;

  try {
    // Get the printable area element
    const element = document.getElementById('resume-canvas-printable-area');
    if (!element) {
      throw new Error('Resume canvas not found');
    }

    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank', 'width=794,height=1123');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    // Enhanced CSS for perfect A4 PDF output
    const pdfCSS = `
      <style type="text/css">
        @page {
          size: A4;
          margin: 0;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          width: 210mm !important;
          height: 297mm !important;
          overflow: hidden !important;
        }
        
        #resume-canvas-printable-area {
          position: relative !important;
          left: 0 !important;
          top: 0 !important;
          width: 210mm !important;
          height: 297mm !important;
          padding: 20mm 25mm !important;
          margin: 0 !important;
          box-shadow: none !important;
          background: white !important;
          
          /* Perfect text rendering - fix baseline alignment */
          font-size: 11px !important;
          line-height: 1.4 !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          text-rendering: optimizeLegibility !important;
          
          /* Fix text baseline and vertical alignment */
          vertical-align: baseline !important;
          
          /* Text layout optimization */
          word-wrap: break-word !important;
          hyphens: auto !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
          
          /* Ensure proper text flow */
          white-space: normal !important;
          text-align: left !important;
        }
        
        /* Ensure consistent text rendering */
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          font-weight: 600 !important;
          vertical-align: baseline !important;
          line-height: inherit !important;
        }
        
        p {
          orphans: 3 !important;
          widows: 3 !important;
          margin: 0 !important;
          vertical-align: baseline !important;
          line-height: inherit !important;
        }
        
        /* Fix icon and text alignment */
        svg {
          vertical-align: middle !important;
          display: inline-block !important;
        }
        
        /* Fix flex item alignment */
        .flex > * {
          vertical-align: baseline !important;
        }
        
        /* Ensure consistent spacing for all elements */
        * {
          vertical-align: baseline !important;
          box-sizing: border-box !important;
        }
        
        /* Image optimization */
        img {
          max-width: 100% !important;
          height: auto !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Fix text alignment and spacing */
        .text-center {
          text-align: center !important;
        }
        
        .text-left {
          text-align: left !important;
        }
        
        .text-right {
          text-align: right !important;
        }
        
        /* Ensure proper spacing */
        .mb-1 { margin-bottom: 0.25rem !important; }
        .mb-2 { margin-bottom: 0.5rem !important; }
        .mb-3 { margin-bottom: 0.75rem !important; }
        .mb-4 { margin-bottom: 1rem !important; }
        .mb-5 { margin-bottom: 1.25rem !important; }
        .mb-6 { margin-bottom: 1.5rem !important; }
        
        .mt-1 { margin-top: 0.25rem !important; }
        .mt-2 { margin-top: 0.5rem !important; }
        .mt-3 { margin-top: 0.75rem !important; }
        
        .pb-1 { padding-bottom: 0.25rem !important; }
        .pb-2 { padding-bottom: 0.5rem !important; }
        .pb-3 { padding-bottom: 0.75rem !important; }
        
        /* Border styles */
        .border-b {
          border-bottom: 1px solid #e5e7eb !important;
        }
        
        .border-primary\\/50 {
          border-color: rgba(63, 81, 181, 0.5) !important;
        }
        
        /* Color classes */
        .text-primary {
          color: #3F51B5 !important;
        }
        
        .text-muted-foreground {
          color: #6b7280 !important;
        }
        
        .text-foreground {
          color: #111827 !important;
        }
        
        .text-gray-800 {
          color: #1f2937 !important;
        }
        
        .text-gray-600 {
          color: #4b5563 !important;
        }
        
        .text-gray-700 {
          color: #374151 !important;
        }
        
        .text-gray-500 {
          color: #6b7280 !important;
        }
        
        /* Background colors */
        .bg-gray-200 {
          background-color: #e5e7eb !important;
        }
        
        .bg-secondary {
          background-color: #f3f4f6 !important;
        }
        
        /* Font weights */
        .font-bold {
          font-weight: 700 !important;
        }
        
        .font-semibold {
          font-weight: 600 !important;
        }
        
        .font-medium {
          font-weight: 500 !important;
        }
        
        /* Font sizes */
        .text-2xl {
          font-size: 1.5rem !important;
          line-height: 2rem !important;
        }
        
        .text-xl {
          font-size: 1.25rem !important;
          line-height: 1.75rem !important;
        }
        
        .text-base {
          font-size: 1rem !important;
          line-height: 1.5rem !important;
        }
        
        .text-sm {
          font-size: 0.875rem !important;
          line-height: 1.25rem !important;
        }
        
        .text-xs {
          font-size: 0.75rem !important;
          line-height: 1rem !important;
        }
        
        .text-\\[13px\\] {
          font-size: 13px !important;
        }
        
        .text-\\[12px\\] {
          font-size: 12px !important;
        }
        
        .text-\\[11px\\] {
          font-size: 11px !important;
        }
        
        .text-\\[10px\\] {
          font-size: 10px !important;
        }
        
        .text-\\[9px\\] {
          font-size: 9px !important;
        }
        
        /* Line heights */
        .leading-\\[1\\.4\\] {
          line-height: 1.4 !important;
        }
        
        /* Flexbox */
        .flex {
          display: flex !important;
        }
        
        .flex-col {
          flex-direction: column !important;
        }
        
        .flex-wrap {
          flex-wrap: wrap !important;
        }
        
        .items-center {
          align-items: center !important;
        }
        
        .items-start {
          align-items: flex-start !important;
        }
        
        .justify-center {
          justify-content: center !important;
        }
        
        .gap-1 {
          gap: 0.25rem !important;
        }
        
        .gap-3 {
          gap: 0.75rem !important;
        }
        
        .gap-4 {
          gap: 1rem !important;
        }
        
        /* Spacing utilities */
        .space-y-1 > * + * {
          margin-top: 0.25rem !important;
        }
        
        .space-y-2 > * + * {
          margin-top: 0.5rem !important;
        }
        
        .space-y-3 > * + * {
          margin-top: 0.75rem !important;
        }
        
        /* Rounded corners */
        .rounded-full {
          border-radius: 9999px !important;
        }
        
        .rounded-full {
          border-radius: 9999px !important;
        }
        
        /* Inline styles */
        .inline-block {
          display: inline-block !important;
        }
        
        /* Padding for skill tags */
        .px-2 {
          padding-left: 0.5rem !important;
          padding-right: 0.5rem !important;
        }
        
        .py-1 {
          padding-top: 0.25rem !important;
          padding-bottom: 0.25rem !important;
        }
        
        .mr-1 {
          margin-right: 0.25rem !important;
        }
        
        .mb-1 {
          margin-bottom: 0.25rem !important;
        }
        
        /* Avatar styles */
        .w-16 {
          width: 4rem !important;
        }
        
        .h-16 {
          height: 4rem !important;
        }
        
        .w-20 {
          width: 5rem !important;
        }
        
        .h-20 {
          height: 5rem !important;
        }
        
        .overflow-hidden {
          overflow: hidden !important;
        }
        
        .object-cover {
          object-fit: cover !important;
        }
        
        .border-2 {
          border-width: 2px !important;
        }
        
        .border-3 {
          border-width: 3px !important;
        }
        
        .border-primary\\/20 {
          border-color: rgba(63, 81, 181, 0.2) !important;
        }
        
        .flex-shrink-0 {
          flex-shrink: 0 !important;
        }
        
        .flex-grow {
          flex-grow: 1 !important;
        }
      </style>
    `;

    // Build the complete HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Resume - ${resumeData.personalDetails.fullName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
          ${pdfCSS}
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `;

    // Write content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for fonts and content to load
    await new Promise(resolve => {
      printWindow.onload = () => {
        setTimeout(resolve, 500); // Give extra time for fonts to load
      };
    });

    // Trigger print dialog with save as PDF option
    printWindow.print();
    
    // Close the window after a delay
    setTimeout(() => {
      printWindow.close();
    }, 1000);

  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Enhanced print function with consistent styling
 */
export function printResume(): void {
  try {
    // Use the same PDF export function for printing
    // This ensures consistency between print and PDF export
    const resumeElement = document.getElementById('resume-canvas-printable-area');
    if (!resumeElement) {
      throw new Error('Resume canvas not found');
    }

    // Create enhanced print styles
    const printCSS = `
      <style type="text/css" media="print">
        @page {
          size: A4;
          margin: 0;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        
        body * {
          visibility: hidden;
        }
        
        #resume-canvas-printable-area,
        #resume-canvas-printable-area * {
          visibility: visible;
        }
        
        #resume-canvas-printable-area {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 210mm !important;
          height: 297mm !important;
          padding: 20mm 25mm !important;
          margin: 0 !important;
          box-shadow: none !important;
          background: white !important;
          font-size: 11px !important;
          line-height: 1.4 !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          word-wrap: break-word;
          hyphens: auto;
          overflow: hidden;
        }
        
        .no-print {
          display: none !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
        }
        
        p {
          orphans: 3;
          widows: 3;
        }
        
        img {
          max-width: 100% !important;
          height: auto !important;
        }
      </style>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    // Build the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume - ${document.title}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
          ${printCSS}
        </head>
        <body>
          ${resumeElement.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };

  } catch (error) {
    console.error('Error printing resume:', error);
    throw new Error(`Failed to print resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if the current browser supports the required features
 */
export function isPDFExportSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.print === 'function' && typeof window.open === 'function';
}

/**
 * Get estimated file size for PDF export
 */
export function estimatePDFSize(scale: number = 2): string {
  return "Vector PDF (~50-100 KB)";
} 