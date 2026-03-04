import { NavLink, Outlet } from 'react-router-dom'
import { tools } from '../../tools'
import { useAppStore } from '../stores/useAppStore'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm transition',
    isActive ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100',
  ].join(' ')

export default function AppLayout() {
  const compactNav = useAppStore((state) => state.compactNav)
  const toggleCompactNav = useAppStore((state) => state.toggleCompactNav)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="text-base font-semibold tracking-wide text-cyan-300">
            WebToolbox
          </NavLink>
          <button
            type="button"
            onClick={toggleCompactNav}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-500"
          >
            {compactNav ? '展开菜单' : '收起菜单'}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className={compactNav ? 'hidden md:block' : 'space-y-2'}>
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">Tools</p>
          <nav className="space-y-1">
            <NavLink to="/" end className={navLinkClass}>
              首页
            </NavLink>
            {tools.map((tool) => (
              <NavLink key={tool.id} to={`/${tool.path}`} className={navLinkClass}>
                {tool.name}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-black/20">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
