'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Editor, Range, Transforms } from 'slate';
import { useSlate, useSlateSelection } from 'slate-react';
import {
  Bold,
  Italic,
  Code as CodeIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Sparkles,
} from 'lucide-react';
import {
  toggleWrap,
  toggleLink,
  toggleBulletedList,
  toggleNumberedList,
} from '@/lib/markdownTextTransforms';

export interface MarkdownFloatingToolbarProps {
  enableAIModifyButton?: boolean;
}

export default function MarkdownFloatingToolbar({
  enableAIModifyButton = false,
}: MarkdownFloatingToolbarProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const editor = useSlate();
  const selection = useSlateSelection();
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  const isNonCollapsedSelection =
    !!selection && !Range.isCollapsed(selection as Range);
  const isShown = isClient && isNonCollapsedSelection;

  const replaceSelectionWith = React.useCallback(
    (newText: string) => {
      if (!selection) return;
      Transforms.delete(editor, { at: selection });
      Transforms.insertText(editor, newText, { at: selection });
    },
    [editor, selection]
  );

  const withSelectedText = React.useCallback(
    (fn: (t: string) => string | void) => {
      const current = selection ? Editor.string(editor, selection) : '';
      const result = fn(current);
      if (typeof result === 'string') replaceSelectionWith(result);
    },
    [editor, selection, replaceSelectionWith]
  );

  const onBold = React.useCallback(
    () => withSelectedText((t) => toggleWrap(t, '**')),
    [withSelectedText]
  );
  const onItalic = React.useCallback(
    () => withSelectedText((t) => toggleWrap(t, '*')),
    [withSelectedText]
  );
  const onCode = React.useCallback(
    () => withSelectedText((t) => toggleWrap(t, '`')),
    [withSelectedText]
  );
  const onLink = React.useCallback(
    () => withSelectedText((t) => toggleLink(t)),
    [withSelectedText]
  );
  const onBulletedList = React.useCallback(
    () => withSelectedText(toggleBulletedList),
    [withSelectedText]
  );
  const onNumberedList = React.useCallback(
    () => withSelectedText(toggleNumberedList),
    [withSelectedText]
  );

  const recalcPosition = React.useCallback(() => {
    const el = ref.current;
    if (!el || !isShown) return;

    const dom = window.getSelection();
    if (!dom || dom.rangeCount === 0) return;
    const range = dom.getRangeAt(0);

    // Use client rects to better handle multi-line selections
    const rects = range.getClientRects();
    let baseRect: DOMRect | null = null;
    if (rects && rects.length > 0) {
      // pick the top-most rect
      let topRect = rects[0];
      for (let i = 1; i < rects.length; i++) {
        if (rects[i].top < topRect.top) topRect = rects[i];
      }
      // Create a DOMRect-like object for consistency
      baseRect = new DOMRect(
        topRect.left,
        topRect.top,
        topRect.width,
        topRect.height
      );
    } else {
      const r = range.getBoundingClientRect();
      baseRect = new DOMRect(r.left, r.top, r.width, r.height);
    }

    if (!baseRect) return;
    if (
      baseRect.top === 0 &&
      baseRect.left === 0 &&
      baseRect.width === 0 &&
      baseRect.height === 0
    )
      return;

    const offset = 8;

    // Preferred above selection
    const aboveTop = baseRect.top + window.scrollY - el.offsetHeight - offset;
    const belowTop = baseRect.bottom + window.scrollY + offset;

    let top = aboveTop;
    if (top < offset) {
      // flip below if not enough space above
      top = belowTop;
    }

    const centerX = baseRect.left + baseRect.width / 2 + window.scrollX;
    let left = centerX - el.offsetWidth / 2;

    // clamp horizontally
    const minX = offset;
    const maxX = window.innerWidth - el.offsetWidth - offset;
    if (left < minX) left = minX;
    if (left > maxX) left = Math.max(minX, maxX);

    el.style.opacity = '1';
    el.style.position = 'absolute';
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
  }, [isShown]);

  // Recalc on mount/show and on selection change
  React.useLayoutEffect(() => {
    if (!isShown) return;
    recalcPosition();

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recalcPosition);
    };
    const onResize = onScroll;
    const onSelectionChange = onScroll;

    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    document.addEventListener('selectionchange', onSelectionChange);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, [isShown, recalcPosition]);

  if (!isShown) return null;

  return createPortal(
    <div
      ref={ref}
      className="copilot-kit-textarea-css-scope p-2 absolute z-20 top-[-10000px] left-[-10000px] mt-[-6px] transition-opacity duration-150 bg-white/90 backdrop-blur-lg rounded-lg shadow-lg border border-gray-200/50"
      role="toolbar"
      aria-label="Formatting"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onBold();
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label="Bold"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onItalic();
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label="Italic"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onBulletedList();
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label="Bulleted list"
          title="Bulleted list"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onNumberedList();
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label="Numbered list"
          title="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onCode();
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label="Inline code"
          title="Inline code"
        >
          <CodeIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onLink();
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label="Link"
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        {enableAIModifyButton && (
          <>
            <div className="mx-1 h-4 w-px bg-gray-200" aria-hidden="true" />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                window.dispatchEvent(
                  new CustomEvent('resume:openHoveringEditor', {
                    detail: { source: 'markdown-toolbar' },
                  })
                );
              }}
              className="p-1.5 rounded hover:bg-gray-100"
              aria-label="AI Modify"
              title="AI Modify"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
