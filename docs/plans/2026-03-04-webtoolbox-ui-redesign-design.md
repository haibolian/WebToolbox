# WebToolbox UI 重构设计（shadcn + 分类化）

**日期：** 2026-03-04  
**状态：** 已确认，可实施

## 1. 目标与约束
- 使用 `shadcn/ui` 组件体系重构界面。
- 一级导航是“分类”，而非单个工具。
- 首页保留“分类看板”能力。
- 分类页采用“子工具卡片列表”。
- 风格为“专业工具台”：深色、紧凑、效率优先。
- 补充规则：允许“无一级分类”的直达工具直接出现在导航中。

## 2. 信息架构（已确认）
- 路由层级：
  - `/`：总览（分类看板）
  - `/categories/:categoryId`：分类页（工具卡片）
  - `/tools/:toolId`：工具页（工作台）
- 当前分类与工具：
  - 分类：`image`
  - 工具：`image-text-edit`、`image-color-edit`
  - 直达工具：`text-counter`

### 2.1 混合导航行为
- 分类工具（有 `categoryId`）：在分类页中进入，打开后使用独立工具页进行操作。
- 直达工具（无 `categoryId`）：在左侧导航直接可见，点击后在右侧主区直接展示工具。

## 3. shadcn 组件映射（已确认）
- 布局：`Sidebar` 风格侧栏 + 顶栏 + 主区 + 参数区
- 组件：`Card`、`Button`、`Badge`、`Input`、`Separator`
- 交互：可见 focus ring、按钮与卡片 hover 反馈、键盘可达

## 4. 数据模型与扩展规则（已确认）
- `Category`: `id/name/description/order/enabled`
- `Tool`: `id/categoryId/name/description/status`
- `AppNavState`: `sidebarCollapsed/toolSearch/recentToolIds`
- 扩展策略：未来新增分类仅追加配置，不改布局骨架。

## 5. 测试与验收标准（本次补充）
### 5.1 单元测试（Vitest）
- 访问 `/` 能看到“分类总览”。
- 访问 `/categories/image` 能看到“图片文本编辑/图片色彩编辑”卡片。
- 访问 `/tools/image-text-edit` 能看到对应工具页标题。
- 访问不存在路由返回 404 页面。

### 5.2 E2E（Playwright）
- 从总览进入“图片”分类。
- 从分类页打开“图片文本编辑”。
- URL 与页面标题匹配。

### 5.3 UI 质量门禁
- 交互元素具备 `focus-visible` 样式。
- 可点击区域满足最小触达尺寸（44px）。
- 移动端无横向滚动（375px）。
- 深色主题可读性满足对比要求。

### 5.4 完成定义
- `pnpm lint`、`pnpm test`、`pnpm build`、`pnpm test:e2e` 全通过。
- README 更新为分类化架构与运行说明。
