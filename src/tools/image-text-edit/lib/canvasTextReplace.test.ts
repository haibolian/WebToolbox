import { describe, expect, test } from 'vitest'
import { fitFontSize, pickTextColor, type RGB } from './canvasTextReplace'

describe('canvasTextReplace helpers', () => {
  test('pickTextColor returns dark text on light background', () => {
    const lightBackground: RGB = { r: 240, g: 240, b: 240 }
    expect(pickTextColor(lightBackground)).toBe('rgb(15, 23, 42)')
  })

  test('pickTextColor returns light text on dark background', () => {
    const darkBackground: RGB = { r: 24, g: 24, b: 27 }
    expect(pickTextColor(darkBackground)).toBe('rgb(248, 250, 252)')
  })

  test('fitFontSize shrinks to fit width and height', () => {
    const context = {
      font: '',
      measureText: (text: string) => {
        const parsed = /(\d+)px/.exec(context.font)
        const currentFontSize = parsed ? Number(parsed[1]) : 10
        return { width: text.length * currentFontSize * 0.55 } as TextMetrics
      },
    } as unknown as CanvasRenderingContext2D

    const size = fitFontSize({
      context,
      text: 'LongReplacementText',
      fontFamily: 'sans-serif',
      maxWidth: 80,
      maxHeight: 20,
      initialFontSize: 28,
      minFontSize: 10,
    })

    expect(size).toBeGreaterThanOrEqual(10)
    expect(size).toBeLessThanOrEqual(20)
  })
})
