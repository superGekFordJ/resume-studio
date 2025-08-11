'use client';

import * as React from 'react';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset as floatingOffset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  type Placement,
} from '@floating-ui/react';
import { inline } from '@floating-ui/react';
import { cn } from '@/lib/utils';
import type { VirtualElement } from '@floating-ui/react';

export interface FloatingLayerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Either provide a DOM anchor or a virtual anchor (e.g. selection range)
  anchorRef?: React.RefObject<HTMLElement | null>;
  virtualRef?: VirtualElement;
  children: React.ReactNode;
  placement?: Placement;
  offset?: number;
  matchWidth?: boolean;
  strategy?: 'absolute' | 'fixed';
  className?: string;
  role?: 'dialog' | 'listbox' | 'menu' | 'tooltip' | 'region' | 'toolbar';
  withFocusManager?: boolean; // 默认 false；Combobox 不需要焦点陷阱
  // 允许父组件拿到浮层根节点，便于 hover 稳定控制
  floatingRef?: React.Ref<HTMLElement | null>;
  onMouseEnterContent?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeaveContent?: React.MouseEventHandler<HTMLDivElement>;
  // 关闭策略
  closeOnOutsidePress?: boolean;
  closeOnEsc?: boolean;
  // 针对 selection range 的多行/折行定位
  withInline?: boolean;
}

/**
 * FloatingLayer - 通用浮层容器
 * - Portal 到 body
 * - 支持翻转/避让/同宽/自动更新
 * - 仅在 open 时挂载监听
 */
export function FloatingLayer({
  open,
  onOpenChange,
  anchorRef,
  virtualRef,
  children,
  placement = 'bottom-start',
  offset = 6,
  matchWidth = true,
  strategy = 'fixed',
  className,
  role,
  withFocusManager = false,
  floatingRef,
  onMouseEnterContent,
  onMouseLeaveContent,
  closeOnOutsidePress = true,
  closeOnEsc = true,
  withInline = false,
}: FloatingLayerProps) {
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement,
    strategy,
    whileElementsMounted: open ? autoUpdate : undefined,
    middleware: [
      withInline ? inline() : undefined,
      floatingOffset(offset),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      matchWidth
        ? size({
            apply({
              rects,
              elements,
            }: {
              rects: { reference: { width: number } };
              elements: { floating: Element | null };
            }) {
              const floatingEl = elements.floating as HTMLElement | null;
              if (floatingEl) {
                floatingEl.style.width = `${rects.reference.width}px`;
              }
            },
          })
        : undefined,
    ].filter(Boolean),
  });

  // 让浮层能感知外部点击、Esc 关闭
  const dismiss = useDismiss(context, {
    outsidePress: closeOnOutsidePress,
    outsidePressEvent: 'mousedown',
    escapeKey: closeOnEsc,
  });
  const { getFloatingProps } = useInteractions([dismiss]);

  // 绑定参考元素（支持虚拟参考）
  React.useLayoutEffect(() => {
    if (virtualRef) {
      // Per Floating UI docs: use setPositionReference for virtual elements
      refs.setPositionReference(virtualRef);
      return;
    }
    if (anchorRef?.current) {
      refs.setReference(anchorRef.current);
    }
  }, [virtualRef, anchorRef, refs]);

  // 合并外部浮层 ref
  const setFloating = React.useCallback(
    (node: HTMLElement | null) => {
      refs.setFloating(node);
      if (!floatingRef) return;
      if (typeof floatingRef === 'function') {
        floatingRef(node);
      } else if (typeof floatingRef === 'object' && floatingRef) {
        (floatingRef as unknown as { current: HTMLElement | null }).current =
          node;
      }
    },
    [refs, floatingRef]
  );

  if (!open) return null;

  // expose side for CSS variants like data-[side=top]
  const side =
    (placement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left') ||
    'bottom';

  const floatingNode = (
    <div
      ref={setFloating}
      style={floatingStyles as React.CSSProperties}
      {...getFloatingProps()}
      role={role}
      className={cn(
        'z-[60] rounded-md border bg-popover text-popover-foreground shadow-md outline-none',
        className
      )}
      data-state="open"
      data-side={side}
      onMouseEnter={onMouseEnterContent}
      onMouseLeave={onMouseLeaveContent}
    >
      {children}
    </div>
  );

  return (
    <FloatingPortal>
      {withFocusManager ? (
        <FloatingFocusManager context={context} modal={false}>
          {floatingNode}
        </FloatingFocusManager>
      ) : (
        floatingNode
      )}
    </FloatingPortal>
  );
}
