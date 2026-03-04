import { Search } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { useAppStore } from '../../../app/stores/useAppStore'
import { getCategoryById, getCategoryPath, getToolPath, getToolsByCategory } from '../../index'
import NotFoundPage from '../../not-found/pages/NotFoundPage'

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const toolSearch = useAppStore((state) => state.toolSearch)
  const setToolSearch = useAppStore((state) => state.setToolSearch)

  if (!categoryId) {
    return <NotFoundPage />
  }

  const category = getCategoryById(categoryId)
  if (!category) {
    return <NotFoundPage />
  }

  const tools = getToolsByCategory(category.id)
  const normalizedSearch = toolSearch.trim().toLowerCase()
  const visibleTools = tools.filter((tool) => {
    if (!normalizedSearch) {
      return true
    }
    const content = `${tool.name} ${tool.description}`.toLowerCase()
    return content.includes(normalizedSearch)
  })

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-cyan-300/80">Category</p>
        <h1 className="text-3xl font-semibold tracking-tight">{category.name}</h1>
        <p className="text-sm text-slate-400">{category.description}</p>
      </header>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" aria-hidden="true" />
          <Input
            value={toolSearch}
            onChange={(event) => setToolSearch(event.target.value)}
            placeholder="搜索该分类工具"
            aria-label="搜索该分类工具"
            className="pl-9"
          />
        </label>
        <Badge variant="secondary">{visibleTools.length} / {tools.length}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleTools.map((tool) => (
          <Card key={tool.id} className="border-slate-800/90 bg-slate-900/80">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle>{tool.name}</CardTitle>
                <Badge variant={tool.status === 'active' ? 'default' : 'outline'}>
                  {tool.status === 'active' ? '可用' : '即将上线'}
                </Badge>
              </div>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">路径：{getToolPath(tool.id)}</CardContent>
            <CardFooter className="gap-2">
              <Button asChild size="sm" className="min-h-[44px]">
                <Link to={getToolPath(tool.id)} target="_blank" rel="noopener noreferrer">
                  打开工具
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="min-h-[44px]">
                <Link to={getCategoryPath(category.id)}>刷新列表</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {visibleTools.length === 0 ? (
        <Card className="border-dashed border-slate-700 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-base">未匹配到工具</CardTitle>
            <CardDescription>换个关键词试试，或者清空搜索条件。</CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </section>
  )
}
