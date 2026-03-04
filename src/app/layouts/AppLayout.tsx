import { ImageIcon, LayoutGrid, TextCursorInput } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import { cn } from '../../lib/utils'
import { useAppStore } from '../stores/useAppStore'
import { categories, getCategoryPath, getDirectTools, getToolPath } from '../../tools'

const navLinkClass = (isActive: boolean) =>
  cn(
    'inline-flex min-h-[44px] w-full items-center justify-start gap-2 rounded-md px-3 py-2 text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60',
    isActive
      ? 'bg-slate-800 text-cyan-200'
      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100',
  )

const iconMap: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
}

const directToolIconMap: Record<string, typeof ImageIcon> = {
  'text-counter': TextCursorInput,
}

export default function AppLayout() {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const directTools = getDirectTools()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:rounded-md focus:bg-cyan-500 focus:px-3 focus:py-2 focus:text-slate-950"
      >
        跳转到主内容
      </a>

      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="text-base font-semibold tracking-wide text-cyan-300">
            WebToolbox
          </NavLink>
          <Button type="button" variant="outline" size="sm" onClick={toggleSidebar} className="min-h-[44px]">
            {sidebarCollapsed ? '展开导航' : '收起导航'}
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-4 px-4 py-4 md:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_320px]">
        <aside className={cn(sidebarCollapsed ? 'hidden md:block' : 'space-y-4')} aria-label="分类导航">
          <Card className="border-slate-800/90 bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-slate-400">导航</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
                <LayoutGrid className="mr-2 h-4 w-4" aria-hidden="true" />
                总览
              </NavLink>

              <Separator />

              {categories
                .filter((category) => category.enabled)
                .sort((left, right) => left.order - right.order)
                .map((category) => {
                  const Icon = iconMap[category.id] ?? LayoutGrid
                  return (
                    <NavLink
                      key={category.id}
                      to={getCategoryPath(category.id)}
                      className={({ isActive }) => navLinkClass(isActive)}
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                      {category.name}
                    </NavLink>
                  )
                })}

              {directTools.length > 0 ? (
                <>
                  <Separator />
                  <p className="px-2 text-xs uppercase tracking-wider text-slate-500">直达工具</p>
                  {directTools.map((tool) => {
                    const Icon = directToolIconMap[tool.id] ?? LayoutGrid
                    return (
                      <NavLink
                        key={tool.id}
                        to={getToolPath(tool.id)}
                        className={({ isActive }) => navLinkClass(isActive)}
                      >
                        <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                        {tool.name}
                      </NavLink>
                    )
                  })}
                </>
              ) : null}
            </CardContent>
          </Card>
        </aside>

        <main id="main-content" className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-5 md:p-6">
          <Outlet />
        </main>

        <aside className="hidden xl:block">
          <Card className="border-slate-800/90 bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-base">工作区提示</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p>这里预留全局提醒与快捷操作，可在后续接入任务队列或历史记录。</p>
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-400">
                <li>支持后续多分类扩展</li>
                <li>支持工具状态管理</li>
                <li>支持最近使用回溯</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
