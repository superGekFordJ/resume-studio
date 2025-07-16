# Resume Studio - 实验性 Alpha 分支

> **⚠️ 警告：这是一个仅供开发者使用的实验性分支。**
>
> 这个分支启用了在设置面板中直接输入 API 密钥的功能，为测试各种大语言模型（LLM）提供了更高的性能和更大的灵活性。
>
> **但这带来了巨大的代价：**
> - **禁用了 Helper Functions**：该分支牺牲了主分支先进的 `helperFunction` 功能。这意味着 Prompt 的动态性和上下文感知能力会减弱，导致 AI 交互的灵活性大幅降低。
> - **不稳定性**：此分支不如主分支稳定，并且随时可能发生破坏性更改。
>
> **请仅将此分支用于开发、实验或对核心 AI 服务层做出贡献。** 若需稳定且功能完整的体验，请使用 `main` 分支。

---

一个由 AI 驱动的、采用 Schema 驱动架构的智能简历构建器。此实验性版本允许通过 UI 配置 API 密钥与 LLM直接交互。

![Resume Studio 演示](./demo/diff-view-of-batch-improvement.png)

## 本分支的特定功能

- **直接配置 API 密钥**：在设置面板中直接输入您的 API 密钥，以便即时测试不同的供应商和模型。
- **增强的性能**：绕过某些辅助函数可能会带来更快的 AI 服务响应时间。
- **更强的 LLM 扩展性**：更容易接入和测试不受支持或自定义的 LLM。

## 🚀 快速开始

### 安装

1. **克隆仓库**
   ```bash
   git clone https://github.com/superGekFordJ/Resume-studio.git
   git checkout your-experimental-branch-name  # 切换到你的实验性分支名
   cd Resume-studio
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或者
   pnpm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   # 或者
   pnpm dev
   ```

4. **打开浏览器**
   访问 `http://localhost:9002` 开始实验。

### 配置

- 进入 UI 界面的**设置面板**。
- 选择您的 AI 供应商。
- 将您的 API 密钥直接输入到输入框中。应用程序将使用此密钥进行所有 AI 操作。

> **注意**：虽然您仍然可以在 `.env.local` 中设置密钥，但如果输入了 UI 提供的密钥，则该密钥将优先使用。

## 📚 核心文档

有关核心功能、架构以及如何使用新 Schema 或模板扩展应用的信息，请参阅 `docs/` 目录中的文档。Schema 驱动架构和模板系统的原则保持不变。

- **架构指南**：`docs/architecture.md`
- **模板创建**：`docs/ui/how-to-replicate-a-new-template.md`

## 🤝 参与贡献

欢迎对此实验性分支做出贡献，特别是旨在：
- 改进核心 AI 服务层。
- 在不牺牲性能的情况下恢复 `helperFunction` 的能力。
- 增强多供应商支持。

请随时提出 issue 和提交 pull request。

## 📄 许可证

本项目采用**非商用许可证**。

- ✅ **个人、教育和非商业用途免费**
- ❌ **商业用途需要明确许可**
- 📧 **商业许可请联系**：[hi@fordj.me](mailto:hi@fordj.me) 