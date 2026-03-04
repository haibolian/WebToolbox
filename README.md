# WebToolbox

一个基于 React + TypeScript + Vite 的前端工具箱项目骨架。当前包含首页、工具导航、图片编辑占位页，以及单测与 E2E 冒烟测试配置。

## 技术栈

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- Tailwind CSS v4
- Vitest + React Testing Library
- Playwright

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

# 持续监听测试
pnpm test:watch

# E2E 冒烟测试（首次需安装浏览器）
pnpm exec playwright install
pnpm test:e2e

# 生产构建
pnpm build
```

## 目录结构

```text
src/
  app/
    layouts/         # 全局布局
    router.tsx       # 路由配置
    stores/          # 全局状态（Zustand）
  tools/
    home/            # 首页
    image-editor/    # 图片编辑工具（占位）
    not-found/       # 404 页面
    index.ts         # 工具注册表
  shared/
    ui/              # 共享 UI 组件
```

## 下一步建议

- 在 `src/tools/image-editor` 内接入 Canvas 编辑能力（Konva/Fabric.js）。
- 按工具继续扩展 `src/tools/index.ts` 注册表。
- 为每个工具补充独立单测与 E2E 场景。
