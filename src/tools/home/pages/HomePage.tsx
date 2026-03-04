import { Link } from 'react-router-dom'
import { tools } from '../../index'
import Page from '../../../shared/ui/Page'

export default function HomePage() {
  return (
    <Page
      title="WebToolbox"
      description="一个持续扩展的在线工具集合。当前已准备图片编辑模块入口。"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            to={`/${tool.path}`}
            className="group rounded-xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-600 hover:bg-slate-900"
          >
            <h2 className="text-lg font-medium text-slate-100">{tool.name}</h2>
            <p className="mt-2 text-sm text-slate-400">{tool.description}</p>
            <p className="mt-4 text-sm text-cyan-400 group-hover:text-cyan-300">进入工具 →</p>
          </Link>
        ))}
      </div>
    </Page>
  )
}
