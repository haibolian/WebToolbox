import { Download, LoaderCircle, RefreshCcw, ScanSearch, Upload } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createWorker, PSM } from 'tesseract.js'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { cn } from '../../../lib/utils'
import { replaceTextInCanvas } from '../lib/canvasTextReplace'
import { extractEditableWords, type EditableWord, type OcrDataLike } from '../lib/ocrWords'

const OCR_LANGUAGE: string = 'eng+chi_sim'
const OCR_FALLBACK_LANGUAGE: string = 'eng'

export default function ImageTextEditPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const originalSnapshotRef = useRef<string | null>(null)

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [displayWidth, setDisplayWidth] = useState(0)
  const [sourceFileName, setSourceFileName] = useState('')
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognitionProgress, setRecognitionProgress] = useState(0)
  const [recognitionError, setRecognitionError] = useState('')
  const [statusMessage, setStatusMessage] = useState('上传图片后点击“识别文字”，再对选中文本进行替换。')
  const [words, setWords] = useState<EditableWord[]>([])
  const [selectedWordId, setSelectedWordId] = useState('')
  const [replacementText, setReplacementText] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  const selectedWord = useMemo(
    () => words.find((word) => word.id === selectedWordId) ?? null,
    [selectedWordId, words],
  )

  const stageScale = useMemo(() => {
    if (canvasSize.width === 0 || displayWidth === 0) {
      return 1
    }
    return displayWidth / canvasSize.width
  }, [canvasSize.width, displayWidth])

  useEffect(() => {
    const element = stageRef.current
    if (!element) {
      return
    }

    const updateWidth = () => {
      setDisplayWidth(element.clientWidth)
    }

    updateWidth()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth)
      return () => window.removeEventListener('resize', updateWidth)
    }

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries
      if (entry) {
        setDisplayWidth(entry.contentRect.width)
      }
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const hasImage = canvasSize.width > 0 && canvasSize.height > 0

  const drawImageUrlOnCanvas = useCallback(async (imageUrl: string) => {
    const image = await loadImage(imageUrl)
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    setCanvasSize({ width: canvas.width, height: canvas.height })
  }, [])

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const objectUrl = URL.createObjectURL(file)
    try {
      await drawImageUrlOnCanvas(objectUrl)
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }
      originalSnapshotRef.current = canvas.toDataURL('image/png')
      setSourceFileName(file.name)
      setWords([])
      setSelectedWordId('')
      setReplacementText('')
      setRecognitionError('')
      setStatusMessage('图片加载成功，点击“识别文字”开始。')
    } catch {
      setRecognitionError('图片加载失败，请换一张图片重试。')
    } finally {
      URL.revokeObjectURL(objectUrl)
      event.target.value = ''
    }
  }

  const handleDetectText = async () => {
    const canvas = canvasRef.current
    if (!canvas || !hasImage) {
      return
    }

    setRecognitionError('')
    setStatusMessage('正在识别文字，请稍候…')
    setIsRecognizing(true)
    setRecognitionProgress(0)

    try {
      const snapshot = canvas.toDataURL('image/png')
      const runRecognize = async (language: string) => {
        const worker = await createWorker(language, undefined, {
          logger: (message) => {
            if (
              message.status === 'recognizing text' &&
              typeof message.progress === 'number' &&
              Number.isFinite(message.progress)
            ) {
              setRecognitionProgress(Math.round(message.progress * 100))
            }
          },
        })

        try {
          await worker.setParameters({
            tessedit_pageseg_mode: PSM.SPARSE_TEXT,
            preserve_interword_spaces: '1',
          })

          return (await worker.recognize(
            snapshot,
            { rotateAuto: true },
            { text: true, blocks: true, hocr: true, tsv: true },
          )) as unknown as { data: OcrDataLike }
        } finally {
          await worker.terminate()
        }
      }

      let result: { data: OcrDataLike }
      let nextWords: EditableWord[] = []
      try {
        result = await runRecognize(OCR_LANGUAGE)
        nextWords = extractEditableWords(result.data)

        if (nextWords.length === 0 && languageSupportsFallback(OCR_LANGUAGE, OCR_FALLBACK_LANGUAGE)) {
          const fallbackResult = await runRecognize(OCR_FALLBACK_LANGUAGE)
          const fallbackWords = extractEditableWords(fallbackResult.data)
          if (fallbackWords.length > 0) {
            result = fallbackResult
            nextWords = fallbackWords
          }
        }
      } catch {
        result = await runRecognize(OCR_FALLBACK_LANGUAGE)
        nextWords = extractEditableWords(result.data)
      }

      setWords(nextWords)

      if (nextWords.length === 0) {
        setSelectedWordId('')
        setReplacementText('')
        const rawText = typeof result.data.text === 'string' ? result.data.text.trim() : ''
        if (rawText.length > 0) {
          setStatusMessage('识别到了文本内容，但没有稳定定位到文字框。建议尝试裁剪后再识别。')
        } else {
          setStatusMessage('没有识别到可编辑文字，请尝试更清晰的图片。')
        }
        return
      }

      setSelectedWordId(nextWords[0].id)
      setReplacementText(nextWords[0].text)
      setStatusMessage(`识别完成，共 ${nextWords.length} 处文本。点击标注框或右侧列表选择目标文字。`)
    } catch {
      setRecognitionError('文字识别失败，请稍后重试。')
      setStatusMessage('识别失败。')
    } finally {
      setIsRecognizing(false)
    }
  }

  const handleApplyReplacement = async () => {
    const canvas = canvasRef.current
    if (!canvas || !selectedWord) {
      return
    }

    const replacement = replacementText.trim()
    if (!replacement) {
      setRecognitionError('替换文本不能为空。')
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    setIsApplying(true)
    setRecognitionError('')

    try {
      replaceTextInCanvas({
        context,
        rect: selectedWord.rect,
        replacement,
        fontFamily: 'Arial, PingFang SC, Noto Sans SC, sans-serif',
      })

      setWords((currentWords) =>
        currentWords.map((word) => {
          if (word.id !== selectedWord.id) {
            return word
          }
          return { ...word, text: replacement }
        }),
      )
      setReplacementText(replacement)
      setStatusMessage('文字替换完成。其他区域保持不变，只覆盖选中区域。')
    } finally {
      setIsApplying(false)
    }
  }

  const handleResetImage = async () => {
    const snapshot = originalSnapshotRef.current
    if (!snapshot) {
      return
    }

    await drawImageUrlOnCanvas(snapshot)
    setStatusMessage('已恢复到初始上传状态。')
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const baseName = sourceFileName ? sourceFileName.replace(/\.[^.]+$/, '') : 'image'
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `${baseName}-text-edited.png`
    link.click()
  }

  const selectWord = (word: EditableWord) => {
    setSelectedWordId(word.id)
    setReplacementText(word.text)
  }

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">图片文本编辑</h1>
        <p className="text-sm text-slate-400">上传图片后识别文字，点选目标区域替换文本，并下载修改后的图片。</p>
      </header>

      <Card className="border-slate-800/90 bg-slate-900/80">
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">操作区</CardTitle>
          <CardDescription>{statusMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleUploadImage}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="min-h-[44px]" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              上传图片
            </Button>
            <Button type="button" className="min-h-[44px]" onClick={handleDetectText} disabled={!hasImage || isRecognizing}>
              {isRecognizing ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ScanSearch className="h-4 w-4" aria-hidden="true" />}
              {isRecognizing ? `识别中 ${recognitionProgress}%` : '识别文字'}
            </Button>
            <Button type="button" variant="outline" className="min-h-[44px]" onClick={handleResetImage} disabled={!hasImage}>
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              重置
            </Button>
            <Button type="button" variant="outline" className="min-h-[44px]" onClick={handleDownload} disabled={!hasImage}>
              <Download className="h-4 w-4" aria-hidden="true" />
              下载结果
            </Button>
          </div>

          {sourceFileName ? (
            <p className="text-xs text-slate-500">当前图片：{sourceFileName}</p>
          ) : (
            <p className="text-xs text-slate-500">支持 PNG/JPG/WebP，建议图片清晰以提高识别准确率。</p>
          )}

          {recognitionError ? <p className="text-sm text-rose-300">{recognitionError}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="border-slate-800/90 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-base">画布预览</CardTitle>
            <CardDescription>点击识别框可选择目标文本。替换时仅覆盖该文本区域。</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              ref={stageRef}
              className={cn(
                'relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950/70',
                hasImage ? '' : 'flex h-72 items-center justify-center',
              )}
            >
              <canvas ref={canvasRef} className={cn('block w-full h-auto', hasImage ? 'opacity-100' : 'hidden')} />

              {!hasImage ? <p className="px-4 text-center text-sm text-slate-500">上传图片后在此预览与编辑。</p> : null}

              {hasImage && words.length > 0 ? (
                <div className="pointer-events-none absolute inset-0">
                  {words.map((word) => {
                    const isActive = word.id === selectedWordId
                    return (
                      <button
                        key={word.id}
                        type="button"
                        className={cn(
                          'pointer-events-auto absolute rounded-sm border text-[10px] leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70',
                          isActive
                            ? 'border-cyan-300 bg-cyan-500/15 text-cyan-100'
                            : 'border-amber-300/70 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20',
                        )}
                        style={{
                          left: word.rect.x * stageScale,
                          top: word.rect.y * stageScale,
                          width: Math.max(word.rect.w * stageScale, 18),
                          height: Math.max(word.rect.h * stageScale, 14),
                        }}
                        aria-label={`选择文本 ${word.text}`}
                        onClick={() => selectWord(word)}
                      />
                    )
                  })}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800/90 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-base">文本替换</CardTitle>
            <CardDescription>选中文字后输入新文本，点击“应用替换”。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedWord ? (
              <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-xs text-slate-500">当前选中</p>
                <p className="mt-1 text-sm text-slate-200">{selectedWord.text}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">置信度 {Math.round(selectedWord.confidence)}%</Badge>
                  <Badge variant="outline">
                    x:{Math.round(selectedWord.rect.x)} y:{Math.round(selectedWord.rect.y)}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">还未选择文字。请先点击“识别文字”。</p>
            )}

            <label className="space-y-2 text-sm text-slate-300">
              <span>替换为</span>
              <Input
                value={replacementText}
                onChange={(event) => setReplacementText(event.target.value)}
                placeholder="输入替换后的文本"
                disabled={!selectedWord}
              />
            </label>

            <Button
              type="button"
              className="w-full min-h-[44px]"
              onClick={handleApplyReplacement}
              disabled={!selectedWord || isApplying}
            >
              {isApplying ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              应用替换
            </Button>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-slate-500">识别结果</p>
              <div className="max-h-64 space-y-1 overflow-auto pr-1">
                {words.length === 0 ? (
                  <p className="text-sm text-slate-500">识别后会在这里列出可编辑文本。</p>
                ) : (
                  words.map((word) => (
                    <button
                      key={word.id}
                      type="button"
                      className={cn(
                        'flex min-h-[44px] w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70',
                        word.id === selectedWordId
                          ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-100'
                          : 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-700 hover:bg-slate-900',
                      )}
                      onClick={() => selectWord(word)}
                    >
                      <span className="mr-2 line-clamp-1">{word.text}</span>
                      <span className="text-xs text-slate-500">{Math.round(word.confidence)}%</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image load failed'))
    image.src = url
  })

const languageSupportsFallback = (preferredLanguage: string, fallbackLanguage: string) =>
  preferredLanguage.trim() !== fallbackLanguage.trim()
