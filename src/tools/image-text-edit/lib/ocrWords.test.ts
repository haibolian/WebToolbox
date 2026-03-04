import { describe, expect, test } from 'vitest'
import { extractEditableWords } from './ocrWords'

describe('extractEditableWords', () => {
  test('supports direct words and numeric string bbox values', () => {
    const words = extractEditableWords({
      words: [
        {
          text: '测试',
          confidence: '0.82',
          bbox: { x0: '10', y0: '20', x1: '50', y1: '40' },
        },
      ],
    })

    expect(words).toHaveLength(1)
    expect(words[0]?.text).toBe('测试')
    expect(words[0]?.rect).toEqual({ x: 10, y: 20, w: 40, h: 20 })
    expect(words[0]?.confidence).toBeGreaterThan(80)
  })

  test('supports nested words in blocks > paragraphs > lines', () => {
    const words = extractEditableWords({
      blocks: [
        {
          paragraphs: [
            {
              lines: [
                {
                  words: [
                    {
                      text: 'Hello',
                      confidence: 92,
                      bbox: { x0: 12, y0: 8, x1: 60, y1: 28 },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })

    expect(words).toHaveLength(1)
    expect(words[0]?.text).toBe('Hello')
  })

  test('falls back to line-level text when words are missing', () => {
    const words = extractEditableWords({
      lines: [
        {
          text: 'Line based text',
          bbox: { x0: 5, y0: 15, x1: 145, y1: 45 },
          confidence: 88,
        },
      ],
    })

    expect(words).toHaveLength(1)
    expect(words[0]?.text).toBe('Line based text')
    expect(words[0]?.rect.w).toBe(140)
  })

  test('falls back to line bbox when line words exist but invalid', () => {
    const words = extractEditableWords({
      lines: [
        {
          text: 'Line fallback text',
          bbox: { x0: 12, y0: 16, x1: 152, y1: 56 },
          words: [
            {
              text: 'Line',
            },
            {
              text: 'fallback',
            },
          ],
        },
      ],
    })

    expect(words).toHaveLength(1)
    expect(words[0]?.text).toBe('Line fallback text')
    expect(words[0]?.rect).toEqual({ x: 12, y: 16, w: 140, h: 40 })
  })

  test('supports tsv fallback with word-level bbox', () => {
    const words = extractEditableWords({
      tsv: [
        'level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext',
        '5\t1\t1\t1\t1\t1\t30\t40\t80\t24\t87\tHello',
      ].join('\n'),
    })

    expect(words).toHaveLength(1)
    expect(words[0]?.text).toBe('Hello')
    expect(words[0]?.rect).toEqual({ x: 30, y: 40, w: 80, h: 24 })
  })

  test('supports hocr fallback with bbox', () => {
    const words = extractEditableWords({
      hocr: '<span class="ocrx_word" title="bbox 5 8 65 30; x_wconf 91">你好</span>',
    })

    expect(words).toHaveLength(1)
    expect(words[0]?.text).toBe('你好')
    expect(words[0]?.rect).toEqual({ x: 5, y: 8, w: 60, h: 22 })
  })
})
