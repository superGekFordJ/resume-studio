'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { FloatingLayer } from '@/components/ui/floating/FloatingLayer';
import type { VirtualElement } from '@floating-ui/react';

export interface MarkdownFloatingToolbarProps {
  enableAIModifyButton?: boolean;
}

export default function MarkdownFloatingToolbar({
  enableAIModifyButton = false,
}: MarkdownFloatingToolbarProps) {
  const { t } = useTranslation('components');
  const editor = useSlate();
  const selection = useSlateSelection();
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);
  // Debounce display until selection settles (approx after mouseup)
  const [allowShow, setAllowShow] = React.useState(false);
  React.useEffect(() => {
    setAllowShow(false);
    const id = window.setTimeout(() => setAllowShow(true), 120);
    return () => window.clearTimeout(id);
  }, [selection]);
  // Allow outside-press to close without mutating Slate selection
  const [forceClosed, setForceClosed] = React.useState(false);
  React.useEffect(() => {
    // any selection change re-enables show
    setForceClosed(false);
  }, [selection]);

  const isNonCollapsedSelection =
    !!selection && !Range.isCollapsed(selection as Range);
  const isShown =
    isClient && isNonCollapsedSelection && allowShow && !forceClosed;

  type VirtualElementWithClientRects = VirtualElement & {
    getClientRects: () => DOMRect[];
  };

  const replaceSelectionWith = React.useCallback(
    (newText: string) => {
      if (!selection) return;
      const at = selection as Range;
      const insertPoint = Range.start(at);
      Editor.withoutNormalizing(editor, () => {
        Transforms.delete(editor, { at });
        Transforms.insertText(editor, newText, { at: insertPoint });
      });
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
  // Schedule transforms after current mouse event to avoid selection races
  const schedule = React.useCallback((fn: () => void) => {
    setTimeout(fn, 0);
  }, []);
  // Persist last non-zero rect to avoid jumping to (0,0) while closing
  const lastRectRef = React.useRef<DOMRect | null>(null);
  const virtualRef = React.useMemo(() => {
    return {
      getBoundingClientRect: () => {
        const sel = window.getSelection();
        const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
        const r = range ? range.getBoundingClientRect() : null;
        if (r && (r.width > 0 || r.height > 0)) {
          lastRectRef.current = r;
          return r;
        }
        return lastRectRef.current ?? new DOMRect(0, 0, 0, 0);
      },
      getClientRects: () => {
        const sel = window.getSelection();
        const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
        if (range) {
          const list = range.getClientRects();
          if (list && list.length > 0) return Array.from(list);
        }
        return lastRectRef.current ? [lastRectRef.current] : [];
      },
    } as VirtualElementWithClientRects; // satisfies VirtualElement shape and adds getClientRects
  }, []);

  // 监听 Cmd/Ctrl+K：当 Copilot Suggestion Card 即将显示时，先关闭本浮条，避免重叠
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.code === 'KeyK')) {
        setForceClosed(true);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  const simulateCtrlK = React.useCallback(() => {
    const isMac =
      typeof navigator !== 'undefined' &&
      /Mac|iPhone|iPad/.test(navigator.platform);
    const init: KeyboardEventInit = {
      key: 'k',
      code: 'KeyK',
      bubbles: true,
      cancelable: true,
      composed: true,
      ...(isMac ? { metaKey: true } : { ctrlKey: true }),
    };
    // Prefer dispatching on the currently focused editable element,
    // because many listeners are attached to the element or document, not window.
    const activeEl =
      (document.activeElement as HTMLElement | null) ?? undefined;
    if (activeEl) {
      activeEl.dispatchEvent(new KeyboardEvent('keydown', init));
      activeEl.dispatchEvent(new KeyboardEvent('keyup', init));
    }
    // Also dispatch on document and window as a fallback to reach capture/bubble listeners.
    document.dispatchEvent(new KeyboardEvent('keydown', init));
    document.dispatchEvent(new KeyboardEvent('keyup', init));
    window.dispatchEvent(new KeyboardEvent('keydown', init));
    window.dispatchEvent(new KeyboardEvent('keyup', init));
  }, []);

  if (!isShown) return null;

  return (
    <FloatingLayer
      open={isShown}
      onOpenChange={(open) => {
        if (!open) setForceClosed(true);
      }}
      virtualRef={virtualRef}
      placement="top"
      offset={8}
      matchWidth={false}
      strategy="fixed"
      withInline
      className="copilot-kit-textarea-css-scope p-2 z-[65] mt-[-6px] bg-white/90 backdrop-blur-lg shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=top]:origin-bottom data-[side=bottom]:origin-top"
      role="toolbar"
      withFocusManager={false}
      closeOnOutsidePress
      closeOnEsc
    >
      <div
        className="flex items-center gap-1.5"
        onMouseDown={(e) => e.preventDefault()}
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            schedule(onBold);
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label={t('MarkdownFloatingToolbar.bold')}
          title={t('MarkdownFloatingToolbar.bold')}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            schedule(onItalic);
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label={t('MarkdownFloatingToolbar.italic')}
          title={t('MarkdownFloatingToolbar.italic')}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            schedule(onBulletedList);
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label={t('MarkdownFloatingToolbar.bulletedList')}
          title={t('MarkdownFloatingToolbar.bulletedList')}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            schedule(onNumberedList);
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label={t('MarkdownFloatingToolbar.numberedList')}
          title={t('MarkdownFloatingToolbar.numberedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            schedule(onCode);
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label={t('MarkdownFloatingToolbar.inlineCode')}
          title={t('MarkdownFloatingToolbar.inlineCode')}
        >
          <CodeIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            schedule(onLink);
          }}
          className="p-1.5 rounded hover:bg-gray-100"
          aria-label={t('MarkdownFloatingToolbar.link')}
          title={t('MarkdownFloatingToolbar.link')}
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
                schedule(() => {
                  setForceClosed(true);
                  simulateCtrlK();
                });
              }}
              className="p-1.5 rounded hover:bg-gray-100"
              aria-label={t('MarkdownFloatingToolbar.aiModify')}
              title={t('MarkdownFloatingToolbar.aiModify')}
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </FloatingLayer>
  );
}
