import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'

export default function ImageColorEditPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">图片色彩编辑</h1>
        <p className="text-sm text-slate-400">用于调整亮度、对比度、饱和度、曲线与色相平衡。</p>
      </header>

      <Card className="border-dashed border-slate-700 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="text-base">功能占位</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300">
          后续可加入滤镜预设、历史记录和批量参数同步能力。
        </CardContent>
      </Card>
    </div>
  )
}
