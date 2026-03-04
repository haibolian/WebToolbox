import type { ComponentType } from 'react'
import ImageEditorPage from './image-editor/pages/ImageEditorPage'

export type ToolDefinition = {
  id: string
  name: string
  description: string
  path: string
  Component: ComponentType
}

export const tools: ToolDefinition[] = [
  {
    id: 'image-editor',
    name: '图片编辑',
    description: '基础图片编辑能力（占位页）',
    path: 'tools/image-editor',
    Component: ImageEditorPage,
  },
]
