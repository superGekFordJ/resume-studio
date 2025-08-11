# FloatingLayer 组件 API 与用法

统一的浮层容器，封装 Floating UI 定位、Portal、关闭策略、焦点管理与虚拟锚点支持。

- __文件__：`src/components/ui/floating/FloatingLayer.tsx`
- __依赖__：`@floating-ui/react`

## Props

```ts
export interface FloatingLayerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Either provide a DOM anchor or a virtual anchor (e.g. selection range)
  anchorRef?: React.RefObject<HTMLElement | null>;
  virtualRef?: VirtualElement;
  children: React.ReactNode;
  placement?: Placement;              // 默认 'bottom-start'
  offset?: number;                    // 默认 6
  matchWidth?: boolean;               // 默认 true；下拉同宽常用
  strategy?: 'absolute' | 'fixed';    // 默认 'fixed'
  className?: string;
  role?: 'dialog' | 'listbox' | 'menu' | 'tooltip' | 'region' | 'toolbar';
  withFocusManager?: boolean;         // 默认 false；如 Combobox 关闭焦点陷阱
  floatingRef?: React.Ref<HTMLElement | null>; // 可拿到浮层根节点
  onMouseEnterContent?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeaveContent?: React.MouseEventHandler<HTMLDivElement>;
  closeOnOutsidePress?: boolean;      // 默认 true
  closeOnEsc?: boolean;               // 默认 true
  withInline?: boolean;               // 默认 false；多行选区定位时开启
}
```

## 行为说明

- __定位中间件__：`inline?(可选)` → `offset` → `flip` → `shift` → `size(matchWidth)`。
- __虚拟锚点__：
  - 需要实现 `getBoundingClientRect()`；
  - 如启用 `withInline`，建议同时实现 `getClientRects()` 以增强多行选区定位。
- __Portal__：通过 `FloatingPortal` 渲染到 `body`；`z-index` 统一在外壳上控制。
- __自动更新__：仅在 `open` 时启用 `autoUpdate`，响应滚动/尺寸变化。
- __关闭策略__：支持外部点击与 Esc（可关闭）。
- __焦点管理__：可选 `FloatingFocusManager`，默认关闭以保持输入体验。

## 样式与数据属性

- 容器类：`rounded-md border bg-popover text-popover-foreground shadow-md`。
- 数据属性：`data-state`, `data-side`（如 `top`/`bottom`），便于动画与方向样式。

## 使用示例

### 1) Combobox（同宽下拉）

```tsx
const anchorRef = React.useRef<HTMLInputElement>(null);

<FloatingLayer
  open={open}
  onOpenChange={setOpen}
  anchorRef={anchorRef}
  placement="bottom-start"
  matchWidth
  offset={6}
  withFocusManager={false}
  role="listbox"
>
  <ComboboxList ... />
</FloatingLayer>
```

### 2) Markdown 工具条（多行选区）

```tsx
const lastRectRef = React.useRef<DOMRect | null>(null);
const virtualRef = React.useMemo(() => ({
  getBoundingClientRect() {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    const r = range ? range.getBoundingClientRect() : null;
    if (r && (r.width > 0 || r.height > 0)) lastRectRef.current = r;
    return lastRectRef.current ?? new DOMRect(0, 0, 0, 0);
  },
  getClientRects() {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    if (range) {
      const rects = range.getClientRects();
      if (rects && rects.length) return Array.from(rects);
    }
    return lastRectRef.current ? [lastRectRef.current] : [];
  }
}) as VirtualElement, []);

<FloatingLayer
  open={open}
  onOpenChange={setOpen}
  virtualRef={virtualRef}
  placement="top"
  offset={8}
  strategy="fixed"
  withInline
  role="toolbar"
>
  <Toolbar ... />
</FloatingLayer>
```

### 3) HoverCard（信息卡/选择卡片）

```tsx
const anchorRef = React.useRef<HTMLButtonElement>(null);

<>
  <button ref={anchorRef} type="button" className="underline">
    查看详情
  </button>

  <FloatingLayer
    open={open}
    onOpenChange={setOpen}
    anchorRef={anchorRef}
    placement="right-start"
    offset={8}
    // 根据交互是否需要键盘在卡片内循环，决定是否启用焦点管理
    withFocusManager={false}
    role="region"
  >
    <div className="p-3 w-64">
      <h4 className="font-medium mb-1">候选人匹配度</h4>
      <p className="text-sm text-muted-foreground">
        根据目标岗位关键字自动计算，与当前段落的相关性评分为 86%。
      </p>
      <div className="mt-2 flex gap-2">
        <button className="btn btn-sm" onClick={() => setOpen(false)}>知道了</button>
        <button className="btn btn-sm btn-primary">查看建议</button>
      </div>
    </div>
  </FloatingLayer>
</>
```

## 最佳实践

- 选区类 UI：开启 `withInline` 并提供 `getClientRects()`。
- 下拉类 UI：`matchWidth=true`，关闭焦点陷阱；外部点击关闭。
- 过度 reflow：仅在展开时启用 `autoUpdate`（已内建）。
- 样式统一：边框、背景、阴影尽量由浮层外壳统一提供，避免子内容重复边框。

## 已知限制

- 某些极端 nested scroll 布局下，`fixed` 与 `absolute` 的差异可能影响定位选择，建议优先 `fixed`。

## 相关文档

- **[Floating UI 迁移与规范](./floating-ui-migration.md)**
- **[Markdown 浮动工具栏](./markdown-floating-toolbar.md)**
- **[Combobox Ghost Text](./combobox-ghost-text.md)**
