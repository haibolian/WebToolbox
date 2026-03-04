export type RGB = {
  r: number
  g: number
  b: number
}

export type Rect = {
  x: number
  y: number
  w: number
  h: number
}

type FitFontSizeOptions = {
  context: CanvasRenderingContext2D
  text: string
  fontFamily: string
  maxWidth: number
  maxHeight: number
  initialFontSize: number
  minFontSize: number
}

type ReplaceTextOptions = {
  context: CanvasRenderingContext2D
  rect: Rect
  replacement: string
  fontFamily?: string
  padding?: number
}

const EDGE_PADDING = 2

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const roundRgb = (rgb: RGB): RGB => ({
  r: Math.round(clamp(rgb.r, 0, 255)),
  g: Math.round(clamp(rgb.g, 0, 255)),
  b: Math.round(clamp(rgb.b, 0, 255)),
})

const toRgbString = (rgb: RGB) => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

const luminance = ({ r, g, b }: RGB) => {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return red * 0.2126 + green * 0.7152 + blue * 0.0722
}

const contrastRatio = (left: RGB, right: RGB) => {
  const leftLum = luminance(left)
  const rightLum = luminance(right)
  const [bright, dark] = leftLum > rightLum ? [leftLum, rightLum] : [rightLum, leftLum]
  return (bright + 0.05) / (dark + 0.05)
}

export function fitFontSize({
  context,
  text,
  fontFamily,
  maxWidth,
  maxHeight,
  initialFontSize,
  minFontSize,
}: FitFontSizeOptions) {
  const safeMaxWidth = Math.max(maxWidth, 1)
  const safeMaxHeight = Math.max(maxHeight, 1)
  const safeMinSize = Math.max(minFontSize, 1)
  let fontSize = Math.max(initialFontSize, safeMinSize)

  while (fontSize > safeMinSize) {
    context.font = `${fontSize}px ${fontFamily}`
    const width = context.measureText(text).width
    if (width <= safeMaxWidth && fontSize <= safeMaxHeight) {
      return fontSize
    }
    fontSize -= 1
  }

  return safeMinSize
}

export function pickTextColor(backgroundColor: RGB, sourceTextColor?: RGB) {
  const darkText: RGB = { r: 15, g: 23, b: 42 }
  const lightText: RGB = { r: 248, g: 250, b: 252 }

  if (sourceTextColor) {
    const sourceContrast = contrastRatio(sourceTextColor, backgroundColor)
    if (sourceContrast >= 2.4) {
      return toRgbString(roundRgb(sourceTextColor))
    }
  }

  return contrastRatio(darkText, backgroundColor) >= contrastRatio(lightText, backgroundColor)
    ? toRgbString(darkText)
    : toRgbString(lightText)
}

export function replaceTextInCanvas({
  context,
  rect,
  replacement,
  fontFamily = 'sans-serif',
  padding = 2,
}: ReplaceTextOptions) {
  const cleanText = replacement.trim()
  if (!cleanText) {
    return
  }

  const canvas = context.canvas
  const safeRect: Rect = {
    x: clamp(Math.floor(rect.x), 0, canvas.width - 1),
    y: clamp(Math.floor(rect.y), 0, canvas.height - 1),
    w: clamp(Math.ceil(rect.w), 1, canvas.width),
    h: clamp(Math.ceil(rect.h), 1, canvas.height),
  }

  const sampleRect = getExpandedRect(safeRect, canvas.width, canvas.height, EDGE_PADDING)
  const sampleData = context.getImageData(sampleRect.x, sampleRect.y, sampleRect.w, sampleRect.h)

  const backgroundColor = estimateBackgroundColor(sampleData, {
    x: safeRect.x - sampleRect.x,
    y: safeRect.y - sampleRect.y,
    w: safeRect.w,
    h: safeRect.h,
  })
  const sourceTextColor = estimateCenterColor(sampleData, {
    x: safeRect.x - sampleRect.x,
    y: safeRect.y - sampleRect.y,
    w: safeRect.w,
    h: safeRect.h,
  })

  context.fillStyle = toRgbString(backgroundColor)
  context.fillRect(safeRect.x, safeRect.y, safeRect.w, safeRect.h)

  const horizontalPadding = clamp(Math.round(padding), 0, Math.floor(safeRect.w / 3))
  const verticalPadding = clamp(Math.round(padding), 0, Math.floor(safeRect.h / 4))
  const fontSize = fitFontSize({
    context,
    text: cleanText,
    fontFamily,
    maxWidth: safeRect.w - horizontalPadding * 2,
    maxHeight: safeRect.h - verticalPadding * 2,
    initialFontSize: Math.max(Math.floor(safeRect.h * 0.9), 10),
    minFontSize: 10,
  })

  context.font = `${fontSize}px ${fontFamily}`
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.fillStyle = pickTextColor(backgroundColor, sourceTextColor)

  const y = safeRect.y + safeRect.h / 2
  context.fillText(cleanText, safeRect.x + horizontalPadding, y, safeRect.w - horizontalPadding * 2)
}

const getExpandedRect = (rect: Rect, maxWidth: number, maxHeight: number, amount: number): Rect => {
  const x = clamp(rect.x - amount, 0, maxWidth - 1)
  const y = clamp(rect.y - amount, 0, maxHeight - 1)
  const right = clamp(rect.x + rect.w + amount, 1, maxWidth)
  const bottom = clamp(rect.y + rect.h + amount, 1, maxHeight)
  return {
    x,
    y,
    w: right - x,
    h: bottom - y,
  }
}

const estimateBackgroundColor = (imageData: ImageData, rect: Rect): RGB => {
  const { data, width, height } = imageData
  const left = clamp(Math.floor(rect.x), 0, width - 1)
  const top = clamp(Math.floor(rect.y), 0, height - 1)
  const right = clamp(Math.ceil(rect.x + rect.w), 1, width)
  const bottom = clamp(Math.ceil(rect.y + rect.h), 1, height)

  let r = 0
  let g = 0
  let b = 0
  let count = 0

  const pushPixel = (x: number, y: number) => {
    const index = (y * width + x) * 4
    r += data[index]
    g += data[index + 1]
    b += data[index + 2]
    count += 1
  }

  for (let x = left; x < right; x += 1) {
    pushPixel(x, top)
    pushPixel(x, bottom - 1)
  }

  for (let y = top; y < bottom; y += 1) {
    pushPixel(left, y)
    pushPixel(right - 1, y)
  }

  if (count === 0) {
    return { r: 245, g: 245, b: 245 }
  }

  return roundRgb({ r: r / count, g: g / count, b: b / count })
}

const estimateCenterColor = (imageData: ImageData, rect: Rect): RGB => {
  const { data, width, height } = imageData
  const left = clamp(Math.floor(rect.x + rect.w * 0.2), 0, width - 1)
  const top = clamp(Math.floor(rect.y + rect.h * 0.2), 0, height - 1)
  const right = clamp(Math.ceil(rect.x + rect.w * 0.8), 1, width)
  const bottom = clamp(Math.ceil(rect.y + rect.h * 0.8), 1, height)

  let r = 0
  let g = 0
  let b = 0
  let count = 0

  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const index = (y * width + x) * 4
      r += data[index]
      g += data[index + 1]
      b += data[index + 2]
      count += 1
    }
  }

  if (count === 0) {
    return { r: 30, g: 30, b: 30 }
  }

  return roundRgb({ r: r / count, g: g / count, b: b / count })
}
