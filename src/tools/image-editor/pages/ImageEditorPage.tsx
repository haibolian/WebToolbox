import Page from '../../../shared/ui/Page'

export default function ImageEditorPage() {
  return (
    <Page
      title="图片编辑"
      description="第一版先提供页面骨架，后续会逐步加入裁剪、滤镜、标注等能力。"
    >
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-6">
        <p className="text-sm text-slate-300">功能占位：请在这里接入 Canvas 编辑器。</p>
      </div>
    </Page>
  )
}
