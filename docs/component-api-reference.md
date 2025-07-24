# Resume Studio - 组件 API 参考 (Zustand 集成版)

本参考文档描述了在深度集成 Zustand 状态管理之后，核心组件的API和使用模式。

## 核心架构原则

- **Store驱动**: 大多数核心组件不再通过 props 接收和更新 `resumeData`。它们直接从 `resumeStore` 中订阅所需的状态切片，并调用 store 的 actions 来派发更新。
- **职责分离**: 组件专注于UI渲染和用户事件的捕获。所有业务逻辑、状态管理和AI交互都由 `resumeStore` 和 `SchemaRegistry` 处理。

---

## 核心组件

### 1. ResumeCanvas

主要的简历渲染容器，负责根据 `resumeStore` 中的 `selectedTemplateId` 来渲染相应的模板。

#### Props

```typescript
interface ResumeCanvasProps {
  className?: string; // 额外的CSS类名
}
```

_注意: `resumeData` 不再通过 props 传递，组件会直接从 `resumeStore` 中获取。_

#### 使用示例

```tsx
<ResumeCanvas className="custom-canvas-style" />
```

#### 特性

- 自动模板选择基于 `resumeData.templateId`
- A4 页面尺寸适配
- 打印优化支持
- 响应式设计

---

### 2. TemplateSelector

模板选择器组件，提供可视化的模板选择界面。

#### Props

该组件没有外部 props。它直接与 `resumeStore` 交互，读取 `selectedTemplateId` 并调用 `setSelectedTemplateId` action。

#### 使用示例

```tsx
<TemplateSelector />
```

#### 特性

- 横向滚动的模板预览
- 键盘导航支持
- 选中状态视觉反馈
- 无障碍访问支持

---

### 3. SectionManager

章节管理器，用于显示、排序和管理简历的各个章节。

#### Props

该组件没有外部 props。它直接从 `resumeStore` 读取 `resumeData.sections`，并调用如 `updateSectionVisibility`、`reorderSections` 等 actions。

#### 使用示例

```tsx
<SectionManager />
```

#### 特性

- 章节可见性切换
- 章节重新排序（拖拽）
- 添加新章节
- 删除章节
- 章节类型图标显示

---

### 4. SectionEditor

章节编辑器，提供详细的章节内容编辑功能。

#### Props

```typescript
interface SectionEditorProps {
  // targetToEdit 不再是 prop，而是由组件内部从 store 的 `editingTarget` 状态获取
  onCloseEditor: () => void; // 关闭编辑器的回调，通常会调用 store 的 setEditingTarget(null)
  onBack?: () => void; // 返回结构视图的回调
}
```

_注意: 所有数据读取和更新都通过 `resumeStore` 完成。_

#### 使用示例

```tsx
<SectionEditor />
```

#### 特性

- 动态表单生成
- AI 自动补全集成
- AI 内容改进功能
- 实时预览
- 表单验证
- **滚动优化**: 使用 ScrollArea 确保长内容可滚动
- **自适应布局**: 根据是否在侧边栏导航器中调整布局

---

### 5. SidebarNavigator

两阶段侧边栏导航器，管理结构视图和内容视图之间的切换。其API保持不变，因为它是一个纯布局组件。

#### Props

```typescript
interface SidebarNavigatorProps {
  childrenStructure: React.ReactNode;
  childrenContent: React.ReactNode;
  isEditing: boolean; // 通常由 `editingTarget !== null` 决定
  onBack: () => void;
}
```

#### 使用示例

```tsx
<SidebarNavigator
  isEditing={editingTarget !== null}
  onBack={handleBackToStructure}
  childrenStructure={
    <ScrollArea className="h-full p-4">
      <TemplateSelector />
      <SectionManager />
    </ScrollArea>
  }
  childrenContent={
    <ScrollArea className="h-full">
      <SectionEditor />
    </ScrollArea>
  }
/>
```

#### 特性

- **平滑动画**: 200ms 水平滑动过渡
- **双视图管理**: 结构视图和内容视图的无缝切换
- **返回导航**: 内容视图中的返回按钮
- **响应式设计**: 适配不同屏幕尺寸
- **性能优化**: 使用 CSS transform 实现硬件加速

---

### 6. AutocompleteTextarea

集成了 `copilot-react-kit` 的、支持 AI 自动补全的 Schema 驱动文本输入组件。

#### Props

```typescript
interface AutocompleteTextareaProps
  extends Omit<React.ComponentProps<'textarea'>, 'onChange' | 'value'> {
  // --- Core Functionality ---
  value: string;
  onValueChange: (value: string) => void;

  // --- AI Context (from parent) ---
  isAutocompleteEnabledGlobally: boolean;
  uniqueFieldId: string; // 用于唯一标识textarea实例

  // --- AI Suggestions (from store) ---
  forcedSuggestion?: string | null;
  onForcedSuggestionAccepted?: () => void;
  onForcedSuggestionRejected?: () => void;
}
```

_注意：其他用于构建AI上下文的内部props（如`sectionType`, `itemId`, `name`）被视为 `AIFieldWrapper` 的实现细节，在此处省略以简化API文档。_

#### 使用示例

```tsx
// 在 AIFieldWrapper.tsx 内部使用
<AutocompleteTextarea
  id={uniqueFieldId}
  value={value}
  onValueChange={handleValueChange}
  placeholder={field.uiProps?.placeholder}
  isAutocompleteEnabledGlobally={isAutocompleteEnabled}
/>
```

#### 特性

- 由 `SchemaRegistry` 驱动的上下文感知自动补全。
- 使用 `copilot-react-kit` 提供高性能的内联建议 ("幽灵文本")。
- "热路径"优化：为降低延迟，直接调用AI服务，不通过Store Action。
- 无缝集成来自Store的"强制建议"（AI改进建议）。
- Tab键接受建议。
- Escape键拒绝强制建议。

---

### 7. AIReviewDialog

AI 简历评审对话框组件。其API保持不变。

#### Props

```typescript
interface AIReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reviewContent: ReviewResumeOutput | null;
  isLoading: boolean;
}
```

#### 使用示例

```tsx
<AIReviewDialog
  isOpen={isReviewDialogOpen}
  onClose={() => setIsReviewDialogOpen(false)}
  reviewContent={reviewContent}
  isLoading={isReviewLoading}
/>
```

#### 特性

- Markdown 内容渲染
- 加载骨架屏
- 滚动区域支持
- 响应式布局

---

## 模板组件

### 1. DefaultTemplate

经典专业模板组件。

#### Props

```typescript
interface DefaultTemplateProps {
  resumeData: ResumeData; // 简历数据
}
```

#### 特性

- 传统单栏布局
- 清晰的章节分隔
- 专业的排版风格
- 优化的打印效果

---

### 2. ModernTemplate

现代简约模板组件。

#### Props

```typescript
interface ModernTemplateProps {
  resumeData: ResumeData; // 简历数据
}
```

#### 特性

- 现代化设计风格
- 灵活的布局系统
- 视觉层次清晰
- 移动端友好

---

## 工具组件

### 1. Header

应用头部组件。

#### Props

```typescript
interface HeaderProps {
  onReviewResume: () => void; // 评审简历回调
  onExportPdf: () => void; // 导出PDF回调
}
```

#### 使用示例

```tsx
<Header onReviewResume={handleReviewResume} onExportPdf={handleExportPdf} />
```

#### 特性

- 品牌标识显示
- 主要操作按钮
- 响应式导航
- 主题切换支持

---

## Hooks

### 1. useToast

Toast 通知 Hook，API保持不变。

#### 返回值

```typescript
interface UseToastReturn {
  toast: (props: ToastProps) => void; // 显示toast
  dismiss: (toastId?: string) => void; // 关闭toast
  toasts: ToasterToast[]; // 当前toast列表
}
```

#### 使用示例

```tsx
const { toast } = useToast();

// 显示成功消息
toast({
  title: '保存成功',
  description: '简历已保存到本地存储',
  variant: 'default',
});

// 显示错误消息
toast({
  title: '保存失败',
  description: '请检查网络连接后重试',
  variant: 'destructive',
});
```

---

## 核心类型参考

本节仅包含与组件API最相关的核心类型。完整的类型定义请参阅 `docs/data-structures.md`。

### 1. 核心数据结构

应用的数据核心是 `resumeData`，它由 `resumeStore` 管理。组件通过选择器 (selectors) 从 store 中订阅所需的数据片段。

```typescript
// 示例：在组件中获取数据
const personalDetails = useResumeStore(
  (state) => state.resumeData.personalDetails
);
const sections = useResumeStore((state) => state.resumeData.sections);
```

### 2. 关键AI接口类型

```typescript
// AIContextPayload (传递给 SchemaRegistry 的数据)
export interface AIContextPayload {
  resumeData: any;
  task: 'improve' | 'autocomplete';
  sectionId: string;
  fieldId: string;
  itemId?: string;
  aiConfig?: any;
  inputText?: string; // 光标前文本
  textAfterCursor?: string; // 光标后文本
}

// StructuredAIContext (由 SchemaRegistry 构建并传递给 AI Flow)
export interface StructuredAIContext {
  currentItemContext: string;
  otherSectionsContext: string;
  userJobTitle?: string;
  userJobInfo?: string;
  userBio?: string;
}
```

---

## 事件处理 (Zustand Action 驱动)

组件的事件处理现在通过调用 `resumeStore` 中定义的 actions 来完成，而不是通过 props 传递回调函数。

### 数据更新示例

```typescript
// 在组件中获取 action
const updateField = useResumeStore((state) => state.updateField);

// 在事件处理器中调用 action
const handleValueChange = (newValue: string) => {
  updateField({
    sectionId: 'some_section_id',
    itemId: 'some_item_id',
    fieldId: 'description',
    value: newValue,
  });
};
```

### UI交互事件示例

```typescript
// 在组件中获取 action
const setEditingTarget = useResumeStore((state) => state.setEditingTarget);

// 在事件处理器中调用 action
const handleEditClick = () => {
  setEditingTarget('some_section_id');
};
```

---

## 样式系统

### 1. CSS 类命名约定

```css
/* 组件前缀 */
.resume-canvas {
  /* 主要组件 */
}
.template-selector {
  /* 模板选择器 */
}
.section-manager {
  /* 章节管理器 */
}
.section-editor {
  /* 章节编辑器 */
}

/* 状态修饰符 */
.is-loading {
  /* 加载状态 */
}
.is-active {
  /* 激活状态 */
}
.is-disabled {
  /* 禁用状态 */
}
.is-hidden {
  /* 隐藏状态 */
}

/* 响应式修饰符 */
.mobile-only {
  /* 仅移动端显示 */
}
.desktop-only {
  /* 仅桌面端显示 */
}
.tablet-up {
  /* 平板及以上显示 */
}
```

### 2. Tailwind CSS 工具类

```css
/* 布局 */
.a4-canvas {
  @apply w-[210mm] min-h-[297mm] max-h-[297mm] mx-auto bg-white shadow-lg p-[20mm] box-border overflow-hidden;
}

/* 打印样式 */
.printable-area {
  @apply print:shadow-none print:m-0 print:w-full print:h-screen print:max-h-none;
}
.no-print {
  @apply print:hidden;
}

/* 响应式 */
.responsive-panel {
  @apply w-full md:w-[320px] lg:w-[360px];
}
```

---

## 最佳实践

### 1. 组件使用

```tsx
// ✅ 推荐：使用 TypeScript 类型
const MyComponent: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return <div>{/* 组件内容 */}</div>;
};

// ✅ 推荐：使用 memo 优化性能
const OptimizedComponent = React.memo(MyComponent, (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});

// ✅ 推荐：错误边界处理
const SafeComponent = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <ErrorFallback onRetry={() => setHasError(false)} />;
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>{children}</ErrorBoundary>
  );
};
```

### 2. 状态管理

```tsx
// ✅ 推荐：使用 useCallback 优化回调
const handleUpdate = useCallback((newData: ResumeData) => {
  setResumeData(newData);
}, []);

// ✅ 推荐：使用 useMemo 优化计算
const processedData = useMemo(() => {
  return processResumeData(resumeData);
}, [resumeData]);

// ✅ 推荐：自定义 Hook 封装逻辑
const useResumeEditor = (initialData: ResumeData) => {
  const [data, setData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const updateData = useCallback((updates: Partial<ResumeData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  return { data, isEditing, updateData, setIsEditing };
};
```

### 3. 错误处理

```tsx
// ✅ 推荐：组件级错误处理
const ComponentWithErrorHandling = () => {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <div className="error-container">
        <h3>出现错误</h3>
        <p>{error.message}</p>
        <button onClick={() => setError(null)}>重试</button>
      </div>
    );
  }

  return <ActualComponent onError={setError} />;
};
```

---

### 18. ImageUploadArea

支持图片上传的增强型文本域组件，集成了拖拽、粘贴和加载状态功能。主要用于设置面板中的职位信息提取功能。

#### Props

```typescript
interface ImageUploadAreaProps
  extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'onChange' | 'value'
  > {
  onImageUpload: (file: File) => void; // 图片上传回调
  value: string; // 文本内容
  onChange: (value: string) => void; // 文本变化回调
  id?: string; // HTML id属性
  isLoading?: boolean; // 加载状态，显示spinner和禁用交互
}
```

#### 使用示例

```tsx
const {
  isExtractingJobInfo,
  extractJobInfoFromImage,
  updateAIConfig,
  aiConfig,
} = useResumeStore();

<ImageUploadArea
  value={aiConfig.targetJobInfo || ''}
  onChange={(value) => updateAIConfig({ targetJobInfo: value })}
  onImageUpload={extractJobInfoFromImage}
  isLoading={isExtractingJobInfo}
  placeholder="描述目标职位或拖拽职位截图..."
  rows={4}
/>;
```

#### 特性

- **多种输入方式**: 支持文本输入、图片拖拽、图片粘贴
- **加载状态**: 当`isLoading=true`时显示spinner，禁用所有交互
- **文件类型验证**: 自动验证上传文件是否为图片格式
- **响应式交互**: 拖拽时提供视觉反馈
- **Toast集成**: 自动显示错误提示（文件类型错误等）

#### 集成的Store Actions

- 组件通常与`extractJobInfoFromImage` action配合使用
- 该action会自动管理`isExtractingJobInfo`状态
- 错误处理通过`mapErrorToToast`统一管理

---

_最后更新: 2025-07-25_
_文档版本: v2.2.0_
