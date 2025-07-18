# 如何复刻一个新的简历模板

本文档旨在为开发者提供一个清晰、分步的指南，用于将一个静态的 HTML 简历模板复刻并集成到我们的 Schema 驱动架构中。遵循这些步骤可以确保新模板与现有系统（包括 AI 功能和实时编辑）完全兼容。

## 核心原则

在开始之前，请务必理解以下几个核心原则：

1.  **Schema 驱动 (Schema-Driven)**:
    - **绝对禁止硬编码**。渲染组件**绝不能**通过 `item.fields.find(f => f.key === 'jobTitle')` 这样的方式直接访问数据。
    - 所有数据都必须通过 `pickFieldByRole(item, 'title', roleMap)` 这样的角色工具函数来获取。`RoleMap` 由模板从 `SchemaRegistry` 获取并向下传递。

2.  **布局与渲染分离 (Layout vs. Rendering)**:
    - **模板 (`templates/`) 只负责布局**：决定简历的宏观结构（如双栏、单栏），以及哪个章节 (`section`) 放在哪个位置。
    - **原子组件 (`rendering/`) 只负责渲染**：将接收到的数据以特定的样式（如徽章、时间线区块）呈现出来。

3.  **样式隔离与复用 (Styling Isolation & Reuse)**:
    - **优先创建专有组件**。如果一个通用组件（如 `BadgeListComponent`）在新模板中需要独特的样式（例如，在深色背景上显示），**不要修改原组件**。
    - 正确的做法是：在 `src/components/resume/rendering/` 下创建一个以你的模板命名的文件夹（如 `veridian/`），然后复制一份基础组件并进行样式修改。这能确保你的修改不会影响到其他模板。

## 复刻步骤

### 第 1 步：规划与分析

这是最关键的一步。你需要仔细分析你的静态模板（如 `template3.html`），并将其结构映射到我们的系统中。

1.  **识别布局**: 确定模板是单栏、双栏还是有侧边栏？侧边栏在左还是右？
2.  **内容与 Schema 映射**: 将模板中的每个内容块（如"Experience", "Skills"）与 `src/lib/schemas/defaultSchemas.ts` 中定义的 `SectionSchema` 进行映射。
3.  **创建映射方案**: 制作一个表格，清晰地列出每个 `schemaId` 将被渲染在哪个布局区域，以及打算使用哪个（或新建哪个）原子渲染组件。

**示例 - `Veridian` 模板的映射方案**:

| Schema (`schemaId`)  | 目标区域 | 渲染组件                     | 样式说明                     |
| :------------------- | :------- | :--------------------------- | :--------------------------- |
| **`summary`**        | 主栏     | `SingleTextComponent`        | -                            |
| **`experience`**     | 主栏     | (模板内自定义渲染)           | 需要双行标题和强调色项目符号 |
| **`certifications`** | 侧边栏   | `AchievementItemComponent`   | 需要适配深色背景             |
| **`skills`**         | 侧边栏   | `VeridianBadgeListComponent` | **新建**，适配侧边栏颜色     |

### 第 2 步：创建模板文件和专有组件

1.  **创建模板文件**: 在 `src/components/resume/templates/` 下创建 `YourTemplateName.tsx`。
2.  **创建专有渲染组件**: 如果分析后发现需要自定义样式，请在 `src/components/resume/rendering/` 下创建 `your-template-name/` 目录，并将需要修改的原子组件复制进来进行修改。

### 第 3 步：实现布局与渲染调度

在 `YourTemplateName.tsx` 文件中：

1.  **构建宏观布局**: 使用 `div` 和 `grid` 或 `flex` 实现你的主栏和侧边栏结构。
2.  **处理缩放 (可选)**: 如果你的模板设计了固定的像素宽度（如 `Veridian` 的 `816px`），为了让它完美适应 A4 画布，你需要在根元素上应用 `transform: scale(0.97)` 类似的缩放。
3.  **实现渲染调度函数**:
    - 创建一个（或多个）`renderSection` 函数。
    - 函数内部，使用 `switch (section.schemaId)` 来决定调用哪个原子渲染组件。
    - **关键**：在调用渲染组件之前，必须先从 `SchemaRegistry` 获取 `roleMap`，并将其作为 `prop` 传递下去。

    ```typescript
    // 在 YourTemplateName.tsx 中
    const schemaRegistry = SchemaRegistry.getInstance();

    const renderSectionForSidebar = (section: RenderableSection) => {
      // 1. 获取 RoleMap
      const roleMap = schemaRegistry.getRoleMap(section.schemaId);

      // 2. 调度到正确的原子组件
      switch(section.schemaId) {
        case 'skills':
          // 3. 传入 section 和 roleMap
          return <YourTemplateBadgeListComponent section={section} roleMap={roleMap} />;
        // ... 其他 case
      }
    };
    ```

### 第 4 步：处理求职信 (Cover Letter) 逻辑

这是一个**必须实现**的特殊逻辑，以确保模板的兼容性。

1.  **检测求职信**: `const hasCoverLetter = sections.some(s => s.schemaId === 'cover-letter');`
2.  **条件化布局**:
    - 如果 `hasCoverLetter` 为 `true`，**必须**隐藏侧边栏的其他简历章节，以确保求职信能独立、完整地显示。
    - 你可以选择性地将个人信息从主栏移动到侧边栏，以填充空白。
    - 主栏此时**只应**渲染求职信章节。
    - 参考 `VeridianSidebarTemplate.tsx` 或 `SapphireSidebarTemplate.tsx` 中的实现。

### 第 5 步：注册模板与配置样式

1.  **注册模板信息**:
    - 在 `src/types/resume.ts` 的 `templates` 数组中，添加你的模板信息（`id`, `name`, `imageUrl` 等）。
2.  **注册模板组件**:
    - 在 `src/components/resume/canvas/PrintableResume.tsx` 的 `switch` 语句中，为你的模板 `id` 添加一个 `case`，返回你的模板组件。
3.  **配置全局样式 (可选)**:
    - **字体**: 如果使用了新字体，通过 `npm install @fontsource/your-font` 安装，并在 `src/app/globals.css` 中 `@import`。
    - **全幅渲染**: 如果模板需要移除画布的默认边距，请在 `src/app/globals.css` 中为 `.a4-canvas[data-template-id='your-template-id']` 添加 `padding: 0 !important;` 规则。

## 最终核对清单

- [ ] 模板中没有任何硬编码的字段名 (`item.data.jobTitle`)。
- [ ] 所有数据都通过 `pickFieldByRole` 获取。
- [ ] 所有需要特殊样式的组件都已创建为模板专有版本，没有修改任何共享组件。
- [ ] 求职信的条件渲染逻辑已正确实现。
- [ ] 模板已在 `PrintableResume.tsx` 和 `types/resume.ts` 中注册。
- [ ] 新添加的字体或全局样式已在 `globals.css` 中配置。

遵循此指南，你将能够高效、可靠地为我们的应用贡献新的、高质量的简历模板。
