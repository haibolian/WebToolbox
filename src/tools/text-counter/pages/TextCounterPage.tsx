import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'

const countWords = (value: string) => {
  const normalized = value.trim()
  if (!normalized) {
    return 0
  }

  return normalized.split(/\s+/).length
}

export default function TextCounterPage() {
  const [value, setValue] = useState('')

  const stats = useMemo(() => {
    const characterCount = value.length
    const noSpaceCharacterCount = value.replace(/\s/g, '').length
    const wordCount = countWords(value)

    return {
      characterCount,
      noSpaceCharacterCount,
      wordCount,
    }
  }, [value])

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">文本计数器</h1>
        <p className="text-sm text-slate-400">无分类直达工具示例：点击左侧导航后在右侧主区直接操作。</p>
      </header>

      <Card className="border-slate-800/90 bg-slate-900/80">
        <CardHeader>
          <CardTitle className="text-base">输入文本</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="sr-only" htmlFor="text-counter-input">
            输入需要统计的文本
          </label>
          <textarea
            id="text-counter-input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="在此输入文本..."
            className="min-h-40 w-full rounded-md border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="字符数" value={stats.characterCount} />
            <StatCard label="去空格字符" value={stats.noSpaceCharacterCount} />
            <StatCard label="词数" value={stats.wordCount} />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

type StatCardProps = {
  label: string
  value: number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-100">{value}</p>
    </div>
  )
}
