import { FolderKanban, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'
import {
  categories,
  getCategoryById,
  getCategoryPath,
  getToolById,
  getToolPath,
  getToolsByCategory,
} from '../../index'
import { useAppStore } from '../../../app/stores/useAppStore'

export default function OverviewPage() {
  const recentToolIds = useAppStore((state) => state.recentToolIds)

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-cyan-300/80">Overview</p>
        <h1 className="text-3xl font-semibold tracking-tight">分类总览</h1>
        <p className="text-sm text-slate-400">从分类快速进入工具，后续可扩展到更多非图片类工具。</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {categories
          .filter((category) => category.enabled)
          .sort((left, right) => left.order - right.order)
          .map((category) => {
            const categoryTools = getToolsByCategory(category.id)

            return (
              <Card key={category.id} className="border-slate-800/90 bg-slate-900/80">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FolderKanban className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                      {category.name}
                    </CardTitle>
                    <Badge variant="secondary">{categoryTools.length} 个工具</Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="min-h-[44px]">
                    <Link to={getCategoryPath(category.id)}>进入分类</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
      </div>

      <Card className="border-slate-800/90 bg-slate-900/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5 text-cyan-300" aria-hidden="true" />
            最近使用
          </CardTitle>
          <CardDescription>提高重复操作效率，快速回到最近打开的工具。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentToolIds.length === 0 ? (
            <p className="text-sm text-slate-400">你还没有使用过工具，先进入一个分类开始吧。</p>
          ) : (
            recentToolIds.map((toolId) => {
              const tool = getToolById(toolId)
              if (!tool) {
                return null
              }

              const scopeLabel = tool.categoryId
                ? getCategoryById(tool.categoryId)?.name ?? tool.categoryId
                : '直达'

              return (
                <Link
                  key={tool.id}
                  to={getToolPath(tool.id)}
                  className="flex min-h-[44px] items-center justify-between rounded-md border border-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                >
                  <span>{tool.name}</span>
                  <Badge variant="outline">{scopeLabel}</Badge>
                </Link>
              )
            })
          )}
        </CardContent>
      </Card>
    </section>
  )
}
