# WebToolbox UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把现有单工具骨架升级为“分类工具 + 直达工具”混合导航的 shadcn 风格工具台 UI，并保持可扩展。

**Architecture:** 配置驱动的信息架构（categories + tools），统一动态路由（overview/category/tool），公共布局同时承载“分类导航”和“直达工具导航”，页面使用 shadcn 组件构建。

**Tech Stack:** React, TypeScript, Vite, shadcn-style components, React Router, Zustand, Vitest, Playwright

---

### Task 1: 先写失败测试（RED）
- 更新 `src/app/router.test.tsx` 为分类化断言。
- 运行 `pnpm test`，确认失败原因来自新结构尚未实现。

### Task 2: 接入 shadcn 基础设施
- 安装 shadcn 常用依赖（`clsx/tailwind-merge/cva/radix slot/lucide`）。
- 新增 `src/lib/utils.ts` 与基础 UI 组件（`button/card/badge/input/separator`）。

### Task 3: 实现分类化数据与路由
- 改造 `src/tools/index.ts` 为 `categories + tools` 注册模型。
- 新增总览页、分类页、工具路由页、两个图片工具页。
- 改造 `src/app/layouts/AppLayout.tsx` 与 `src/app/router.tsx`。

### Task 4: 状态与交互完善
- 扩展 Zustand store：侧栏折叠、最近使用。
- 工具页访问记录最近使用，首页展示最近工具。
- 统一空态与 404 处理。

### Task 5: 验证与文档
- 更新 `tests/e2e/navigation.spec.ts` 为新跳转路径。
- 更新 `README.md` 的架构说明。
- 执行 `pnpm lint && pnpm test && pnpm build && pnpm test:e2e`。
