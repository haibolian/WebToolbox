import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { useAppStore } from '../../../app/stores/useAppStore'
import { getCategoryById, getCategoryPath, getToolById } from '../../index'
import NotFoundPage from '../../not-found/pages/NotFoundPage'

export default function ToolRoutePage() {
  const { toolId } = useParams<{ toolId: string }>()
  const markToolVisited = useAppStore((state) => state.markToolVisited)

  const tool = toolId ? getToolById(toolId) : undefined

  useEffect(() => {
    if (tool) {
      markToolVisited(tool.id)
    }
  }, [markToolVisited, tool])

  if (!toolId || !tool) {
    return <NotFoundPage />
  }

  if (tool.launchMode === 'inline') {
    const InlineToolComponent = tool.Component
    return <InlineToolComponent />
  }

  if (!tool.categoryId) {
    return <NotFoundPage />
  }

  const category = getCategoryById(tool.categoryId)
  if (!category) {
    return <NotFoundPage />
  }

  const ToolComponent = tool.Component

  if (tool.workspaceMode === 'full') {
    return (
      <section className="space-y-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-400" aria-label="面包屑">
          <Link
            to="/"
            className="rounded px-2 py-1 transition hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          >
            总览
          </Link>
          <span>/</span>
          <Link
            to={getCategoryPath(category.id)}
            className="rounded px-2 py-1 transition hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          >
            {category.name}
          </Link>
          <span>/</span>
          <span className="text-slate-200">{tool.name}</span>
        </nav>

        <ToolComponent />
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-400" aria-label="面包屑">
        <Link
          to="/"
          className="rounded px-2 py-1 transition hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          总览
        </Link>
        <span>/</span>
        <Link
          to={getCategoryPath(category.id)}
          className="rounded px-2 py-1 transition hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          {category.name}
        </Link>
        <span>/</span>
        <span className="text-slate-200">{tool.name}</span>
      </nav>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-slate-800/90 bg-slate-900/85">
          <CardContent className="pt-6">
            <ToolComponent />
          </CardContent>
        </Card>

        <Card className="border-slate-800/90 bg-slate-900/85">
          <CardHeader>
            <CardTitle className="text-base">参数面板</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <p>后续在这里放置工具参数（字体、颜色、图层、滤镜）。</p>
            <Separator />
            <Button variant="secondary" size="sm" className="w-full min-h-[44px]">
              导入素材
            </Button>
            <Button size="sm" className="w-full min-h-[44px]">
              导出结果
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
