import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/button'

export default function NotFoundPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">页面不存在</h1>
        <p className="text-sm text-slate-400">链接可能已失效或路径不正确。</p>
      </header>

      <Button asChild className="min-h-[44px]">
        <Link to="/">返回总览</Link>
      </Button>
    </section>
  )
}
