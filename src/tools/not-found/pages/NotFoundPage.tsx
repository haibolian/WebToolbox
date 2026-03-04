import { Link } from 'react-router-dom'
import Page from '../../../shared/ui/Page'

export default function NotFoundPage() {
  return (
    <Page title="页面不存在" description="你访问的地址无效，返回首页继续使用工具。">
      <Link
        to="/"
        className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
      >
        返回首页
      </Link>
    </Page>
  )
}
