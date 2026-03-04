import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'

export default function ImageTextEditPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">图片文本编辑</h1>
        <p className="text-sm text-slate-400">用于在图片上添加标题、说明、标签和品牌水印。</p>
      </header>

      <Card className="border-dashed border-slate-700 bg-slate-900/40">
        <CardHeader>
          <CardTitle className="text-base">功能占位</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300">
          后续可加入文本图层、字体面板、对齐吸附和导出模板。
        </CardContent>
      </Card>
    </div>
  )
}
