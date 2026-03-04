# WebToolbox Bootstrap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 初始化一个可运行、可测试、可扩展的前端工具箱基础工程（React + TS + Vite）。

**Architecture:** 采用 SPA 架构，`app/tools/shared` 三层目录。工具通过注册表驱动导航与路由，先落地一个 `image-editor` 占位工具。状态管理使用 Zustand，样式使用 Tailwind。测试分为单测（Vitest）与 E2E（Playwright）骨架。

**Tech Stack:** pnpm, React 19, TypeScript, Vite, React Router, Zustand, Tailwind CSS, Vitest, React Testing Library, Playwright

---

### Task 1: 初始化工程与依赖

**Files:**
- Create: `package.json`（由脚手架生成）
- Create: `src/**`（由脚手架生成）
- Modify: `package.json`（添加依赖与脚本）

**Step 1: 运行脚手架初始化命令**
Run: `pnpm create vite@latest . --template react-ts`
Expected: 生成 React + TS 基础项目。

**Step 2: 安装依赖**
Run: `pnpm install`
Expected: 依赖安装成功，无阻断错误。

**Step 3: 添加功能依赖与开发依赖**
Run: `pnpm add react-router-dom zustand`
Run: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom playwright tailwindcss @tailwindcss/vite`
Expected: 依赖写入 `package.json`。

### Task 2: 建立应用架构骨架

**Files:**
- Create: `src/app/router.tsx`
- Create: `src/app/layouts/AppLayout.tsx`
- Create: `src/tools/index.ts`
- Create: `src/tools/image-editor/pages/ImageEditorPage.tsx`
- Create: `src/shared/ui/Page.tsx`
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`（如保留）

**Step 1: 先写路由行为测试（RED）**
- 新增测试：验证首页渲染、点击进入图片编辑页、未知路由 404。

**Step 2: 运行单测，确认失败（RED 验证）**
Run: `pnpm vitest run`
Expected: 因路由与页面未实现而失败。

**Step 3: 最小实现通过测试（GREEN）**
- 实现 `BrowserRouter` + 注册表驱动导航与页面。

**Step 4: 再跑单测确认通过（GREEN 验证）**
Run: `pnpm vitest run`
Expected: 新增测试通过。

### Task 3: 接入 Tailwind 与基础样式

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/index.css`

**Step 1: 写样式存在性测试（可选）**
- 对关键 class 的 DOM 存在进行断言（非视觉测试）。

**Step 2: 接入 `@tailwindcss/vite` 插件与样式入口**
- 保持最小化配置，确保可用。

**Step 3: 运行测试与构建验证**
Run: `pnpm vitest run`
Run: `pnpm build`
Expected: 单测通过、构建成功。

### Task 4: 建立 E2E 冒烟测试

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/navigation.spec.ts`

**Step 1: 编写冒烟用例**
- 打开首页，点击图片编辑，断言 URL 与标题。

**Step 2: 执行 E2E（如环境支持）**
Run: `pnpm playwright test`
Expected: 本地浏览器环境可运行时通过；若未安装浏览器，记录安装提示。

### Task 5: 文档与验收

**Files:**
- Create: `README.md`

**Step 1: 更新运行说明**
- 包含启动、单测、构建、E2E 命令。

**Step 2: 最终验收命令**
Run: `pnpm vitest run && pnpm build`
Expected: 全部通过。
