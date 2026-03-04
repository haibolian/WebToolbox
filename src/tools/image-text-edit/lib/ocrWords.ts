import type { Rect } from './canvasTextReplace'

export type EditableWord = {
  id: string
  text: string
  confidence: number
  rect: Rect
}

type BboxLike = {
  x0?: number | string
  y0?: number | string
  x1?: number | string
  y1?: number | string
  x?: number | string
  y?: number | string
  w?: number | string
  h?: number | string
  left?: number | string
  top?: number | string
  right?: number | string
  bottom?: number | string
  width?: number | string
  height?: number | string
}

type OcrSymbolLike = {
  text?: unknown
  confidence?: unknown
  bbox?: BboxLike
}

type OcrWordLike = {
  text?: unknown
  confidence?: unknown
  bbox?: BboxLike
  symbols?: OcrSymbolLike[]
}

type OcrLineLike = {
  text?: unknown
  confidence?: unknown
  bbox?: BboxLike
  words?: OcrWordLike[]
  symbols?: OcrSymbolLike[]
}

type OcrParagraphLike = {
  lines?: OcrLineLike[]
}

type OcrBlockLike = {
  paragraphs?: OcrParagraphLike[]
}

export type OcrDataLike = {
  words?: OcrWordLike[]
  lines?: OcrLineLike[]
  paragraphs?: OcrParagraphLike[]
  blocks?: OcrBlockLike[] | null
  text?: unknown
  tsv?: unknown
  hocr?: unknown
}

type ExtractOptions = {
  minConfidence?: number
  minWidth?: number
  minHeight?: number
}

const DEFAULT_MIN_CONFIDENCE = 0
const DEFAULT_MIN_WIDTH = 1
const DEFAULT_MIN_HEIGHT = 1

type CandidateWord = {
  text: string
  confidence: number
  rect: Rect
}

const toFiniteNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeConfidence = (value: unknown) => {
  const parsed = toFiniteNumber(value)
  if (parsed === null) {
    return 0
  }
  if (parsed >= 0 && parsed <= 1) {
    return parsed * 100
  }
  return parsed
}

const normalizeText = (value: unknown) => {
  if (typeof value !== 'string') {
    return ''
  }
  return value.replace(/\s+/g, ' ').trim()
}

const normalizeRect = (bbox?: BboxLike): Rect | null => {
  if (!bbox) {
    return null
  }

  const fromCorners = (
    x0: unknown,
    y0: unknown,
    x1: unknown,
    y1: unknown,
  ): Rect | null => {
    const nX0 = toFiniteNumber(x0)
    const nY0 = toFiniteNumber(y0)
    const nX1 = toFiniteNumber(x1)
    const nY1 = toFiniteNumber(y1)
    if (nX0 === null || nY0 === null || nX1 === null || nY1 === null) {
      return null
    }

    const x = Math.min(nX0, nX1)
    const y = Math.min(nY0, nY1)
    const w = Math.abs(nX1 - nX0)
    const h = Math.abs(nY1 - nY0)

    return { x, y, w, h }
  }

  const fromSize = (x: unknown, y: unknown, w: unknown, h: unknown): Rect | null => {
    const nX = toFiniteNumber(x)
    const nY = toFiniteNumber(y)
    const nW = toFiniteNumber(w)
    const nH = toFiniteNumber(h)
    if (nX === null || nY === null || nW === null || nH === null) {
      return null
    }

    const normalizedX = nW < 0 ? nX + nW : nX
    const normalizedY = nH < 0 ? nY + nH : nY
    return {
      x: normalizedX,
      y: normalizedY,
      w: Math.abs(nW),
      h: Math.abs(nH),
    }
  }

  return (
    fromCorners(bbox.x0, bbox.y0, bbox.x1, bbox.y1) ??
    fromSize(bbox.x, bbox.y, bbox.w, bbox.h) ??
    fromSize(bbox.left, bbox.top, bbox.width, bbox.height) ??
    fromCorners(bbox.left, bbox.top, bbox.right, bbox.bottom)
  )
}

const unionRects = (rects: Rect[]): Rect | null => {
  if (rects.length === 0) {
    return null
  }

  let minX = rects[0].x
  let minY = rects[0].y
  let maxX = rects[0].x + rects[0].w
  let maxY = rects[0].y + rects[0].h

  for (const rect of rects.slice(1)) {
    minX = Math.min(minX, rect.x)
    minY = Math.min(minY, rect.y)
    maxX = Math.max(maxX, rect.x + rect.w)
    maxY = Math.max(maxY, rect.y + rect.h)
  }

  return {
    x: minX,
    y: minY,
    w: Math.max(0, maxX - minX),
    h: Math.max(0, maxY - minY),
  }
}

const getRectFromSymbols = (symbols: unknown): Rect | null => {
  if (!Array.isArray(symbols)) {
    return null
  }

  const rects: Rect[] = []
  for (const symbolItem of symbols) {
    const symbol = symbolItem as OcrSymbolLike
    const rect = normalizeRect(symbol.bbox)
    if (rect) {
      rects.push(rect)
    }
  }

  return unionRects(rects)
}

const textFromSymbols = (symbols: unknown) => {
  if (!Array.isArray(symbols)) {
    return ''
  }

  const chunks: string[] = []
  for (const symbolItem of symbols) {
    const symbol = symbolItem as OcrSymbolLike
    if (typeof symbol.text === 'string') {
      chunks.push(symbol.text)
    }
  }
  return normalizeText(chunks.join(''))
}

const textFromWords = (words: unknown) => {
  if (!Array.isArray(words)) {
    return ''
  }

  const chunks: string[] = []
  for (const wordItem of words) {
    const word = wordItem as OcrWordLike
    const text =
      normalizeText(word.text) ||
      (Array.isArray(word.symbols) && word.symbols.length > 0 ? textFromSymbols(word.symbols) : '')
    if (text) {
      chunks.push(text)
    }
  }

  return normalizeText(chunks.join(' '))
}

const normalizeRichText = (value: string) =>
  normalizeText(
    value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#39;/gi, "'")
      .replace(/&quot;/gi, '"'),
  )

const pushCandidatesFromWordList = (source: unknown, target: CandidateWord[]) => {
  if (!Array.isArray(source)) {
    return
  }
  for (const item of source) {
    const word = item as OcrWordLike
    const text = normalizeText(word.text) || textFromSymbols(word.symbols)
    const rect = normalizeRect(word.bbox) ?? getRectFromSymbols(word.symbols)
    if (!text || !rect) {
      continue
    }

    target.push({
      text,
      confidence: normalizeConfidence(word.confidence),
      rect,
    })
  }
}

const pushCandidatesFromLines = (source: unknown, target: CandidateWord[]) => {
  if (!Array.isArray(source)) {
    return
  }

  for (const lineItem of source) {
    const line = lineItem as OcrLineLike

    if (Array.isArray(line.words) && line.words.length > 0) {
      const beforePush = target.length
      pushCandidatesFromWordList(line.words, target)
      if (target.length > beforePush) {
        continue
      }
    }

    const text = normalizeText(line.text) || textFromWords(line.words) || textFromSymbols(line.symbols)
    const rect = normalizeRect(line.bbox) ?? getRectFromSymbols(line.symbols)
    if (!text || !rect) {
      continue
    }

    target.push({
      text,
      confidence: normalizeConfidence(line.confidence),
      rect,
    })
  }
}

const pushCandidatesFromParagraphs = (source: unknown, target: CandidateWord[]) => {
  if (!Array.isArray(source)) {
    return
  }

  for (const paragraphItem of source) {
    const paragraph = paragraphItem as OcrParagraphLike
    pushCandidatesFromLines(paragraph.lines, target)
  }
}

const pushCandidatesFromBlocks = (source: unknown, target: CandidateWord[]) => {
  if (!Array.isArray(source)) {
    return
  }

  for (const blockItem of source) {
    const block = blockItem as OcrBlockLike
    pushCandidatesFromParagraphs(block.paragraphs, target)
  }
}

const pushCandidatesFromTsv = (source: unknown, target: CandidateWord[]) => {
  if (typeof source !== 'string' || source.trim().length === 0) {
    return
  }

  const rows = source.split(/\r?\n/)
  if (rows.length < 2) {
    return
  }

  const headers = rows[0].split('\t').map((header) => header.trim().toLowerCase())
  const indexByHeader = new Map<string, number>()
  headers.forEach((header, index) => {
    indexByHeader.set(header, index)
  })

  const textIndex = indexByHeader.get('text')
  const leftIndex = indexByHeader.get('left')
  const topIndex = indexByHeader.get('top')
  const widthIndex = indexByHeader.get('width')
  const heightIndex = indexByHeader.get('height')

  if (
    textIndex === undefined ||
    leftIndex === undefined ||
    topIndex === undefined ||
    widthIndex === undefined ||
    heightIndex === undefined
  ) {
    return
  }

  const levelIndex = indexByHeader.get('level')
  const confidenceIndex = indexByHeader.get('conf')

  const getColumnValue = (columns: string[], columnIndex: number | undefined) => {
    if (columnIndex === undefined || columnIndex < 0) {
      return ''
    }
    return columns[columnIndex] ?? ''
  }

  for (const row of rows.slice(1)) {
    if (!row.trim()) {
      continue
    }

    const columns = row.split('\t')

    if (levelIndex !== undefined) {
      const level = toFiniteNumber(getColumnValue(columns, levelIndex))
      if (level !== null && level !== 5) {
        continue
      }
    }

    const text = normalizeText(getColumnValue(columns, textIndex))
    if (!text) {
      continue
    }

    const rect = normalizeRect({
      left: getColumnValue(columns, leftIndex),
      top: getColumnValue(columns, topIndex),
      width: getColumnValue(columns, widthIndex),
      height: getColumnValue(columns, heightIndex),
    })

    if (!rect) {
      continue
    }

    target.push({
      text,
      confidence: normalizeConfidence(getColumnValue(columns, confidenceIndex)),
      rect,
    })
  }
}

const pushCandidatesFromHocr = (source: unknown, target: CandidateWord[]) => {
  if (typeof source !== 'string' || source.trim().length === 0) {
    return
  }

  const wordRegex =
    /<span[^>]*class=["'][^"']*ocrx_word[^"']*["'][^>]*title=["']([^"']+)["'][^>]*>([\s\S]*?)<\/span>/gi

  let match: RegExpExecArray | null
  do {
    match = wordRegex.exec(source)
    if (!match) {
      break
    }

    const title = match[1] ?? ''
    const innerHtml = match[2] ?? ''
    const bboxMatch = /bbox\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/i.exec(
      title,
    )

    if (!bboxMatch) {
      continue
    }

    const text = normalizeRichText(innerHtml)
    if (!text) {
      continue
    }

    const rect = normalizeRect({
      x0: bboxMatch[1],
      y0: bboxMatch[2],
      x1: bboxMatch[3],
      y1: bboxMatch[4],
    })

    if (!rect) {
      continue
    }

    const confidenceMatch = /x_wconf\s+(-?\d+(?:\.\d+)?)/i.exec(title)

    target.push({
      text,
      confidence: normalizeConfidence(confidenceMatch?.[1]),
      rect,
    })
  } while (match)
}

export function extractEditableWords(
  data: OcrDataLike,
  options: ExtractOptions = {},
): EditableWord[] {
  const minConfidence = options.minConfidence ?? DEFAULT_MIN_CONFIDENCE
  const minWidth = options.minWidth ?? DEFAULT_MIN_WIDTH
  const minHeight = options.minHeight ?? DEFAULT_MIN_HEIGHT

  const candidates: CandidateWord[] = []
  pushCandidatesFromWordList(data.words, candidates)
  pushCandidatesFromLines(data.lines, candidates)
  pushCandidatesFromParagraphs(data.paragraphs, candidates)
  pushCandidatesFromBlocks(data.blocks, candidates)
  pushCandidatesFromTsv(data.tsv, candidates)
  pushCandidatesFromHocr(data.hocr, candidates)

  const deduplicated = new Map<string, CandidateWord>()
  for (const candidate of candidates) {
    const key = [
      Math.round(candidate.rect.x),
      Math.round(candidate.rect.y),
      Math.round(candidate.rect.w),
      Math.round(candidate.rect.h),
      candidate.text,
    ].join(':')

    const existing = deduplicated.get(key)
    if (!existing || existing.confidence < candidate.confidence) {
      deduplicated.set(key, candidate)
    }
  }

  return Array.from(deduplicated.values())
    .filter(
      (candidate) =>
        candidate.text.length > 0 &&
        Number.isFinite(candidate.confidence) &&
        candidate.confidence >= minConfidence &&
        candidate.rect.w >= minWidth &&
        candidate.rect.h >= minHeight,
    )
    .sort((left, right) =>
      left.rect.y === right.rect.y ? left.rect.x - right.rect.x : left.rect.y - right.rect.y,
    )
    .map((candidate, index) => ({
      id: `word-${index}-${Math.round(candidate.rect.x)}-${Math.round(candidate.rect.y)}`,
      text: candidate.text,
      confidence: candidate.confidence,
      rect: candidate.rect,
    }))
}
