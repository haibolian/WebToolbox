# WebToolbox

基于 React + TypeScript + Vite 的在线工具箱前端项目。当前采用“分类工具 + 直达工具”混合导航架构，并使用 shadcn 风格组件构建专业工具台 UI。

## 技术栈

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- Tailwind CSS v4
- shadcn-style UI components
- Vitest + React Testing Library
- Playwright

## 当前信息架构（混合模式）

- 总览页：`/`
- 分类页：`/categories/:categoryId`
- 工具页：`/tools/:toolId`

当前内置分类与工具：
- 图片（`image`）
  - 图片文本编辑（`image-text-edit`）
  - 图片色彩编辑（`image-color-edit`）

当前内置直达工具（无一级分类）：
- 文本计数器（`text-counter`）

导航行为：
- 有一级分类的工具：先进入分类，再打开工具独立页操作。
- 无一级分类的工具：直接显示在左侧导航，点击后在右侧主区打开。

## 已实现：图片文本编辑

- 上传 PNG/JPG/WebP 图片
- OCR 自动识别文字（优先中英识别，失败时回退英文）
- 点击识别框选择目标文字并替换
- 替换时仅覆盖选中框区域，尽量减少对其他区域影响
- 下载编辑结果（PNG）

## 本地开发

```bash
pnpm install
pnpm dev
```

默认地址：`http://localhost:5173`

## 测试与构建

```bash
# 单元测试
pnpm test

# 监听模式
pnpm test:watch

# E2E（首次需要安装浏览器）
pnpm exec playwright install
pnpm test:e2e

# 代码检查 + 构建
pnpm lint
pnpm build
```

## 目录结构（核心）

```text
src/
  app/
    layouts/
    router.tsx
    stores/
  components/ui/      # shadcn-style 基础组件
  lib/
    utils.ts
  tools/
    category/         # 分类页
    overview/         # 总览页
    tool-route/       # 工具路由宿主页
    image-text-edit/
    image-color-edit/
    index.ts          # categories/tools 注册表
```

## 扩展方式

1. 在 `src/tools/index.ts` 新增分类配置。
2. 在 `src/tools/index.ts` 新增工具配置并绑定组件。
   - 分类工具：设置 `categoryId`，`launchMode: "page"`。
   - 直达工具：不设置 `categoryId`（或保持空），`launchMode: "inline"`。
3. 新建对应工具页面目录。
4. 路由与导航会自动按配置生效。
