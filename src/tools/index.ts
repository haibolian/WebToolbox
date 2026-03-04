import type { ComponentType } from 'react'
import ImageColorEditPage from './image-color-edit/pages/ImageColorEditPage'
import ImageTextEditPage from './image-text-edit/pages/ImageTextEditPage'
import TextCounterPage from './text-counter/pages/TextCounterPage'

export type CategoryDefinition = {
  id: string
  name: string
  description: string
  order: number
  enabled: boolean
}

export type ToolStatus = 'active' | 'coming-soon'

export type ToolDefinition = {
  id: string
  categoryId?: string
  name: string
  description: string
  status: ToolStatus
  launchMode: 'page' | 'inline'
  Component: ComponentType
}

export const categories: CategoryDefinition[] = [
  {
    id: 'image',
    name: '图片',
    description: '图片处理、文本叠加与色彩调校相关工具。',
    order: 1,
    enabled: true,
  },
]

export const tools: ToolDefinition[] = [
  {
    id: 'image-text-edit',
    categoryId: 'image',
    name: '图片文本编辑',
    description: '在图片上添加文本、调整字体、位置与样式。',
    status: 'active',
    launchMode: 'page',
    Component: ImageTextEditPage,
  },
  {
    id: 'image-color-edit',
    categoryId: 'image',
    name: '图片色彩编辑',
    description: '对图片进行亮度、对比度、饱和度与色调调整。',
    status: 'active',
    launchMode: 'page',
    Component: ImageColorEditPage,
  },
  {
    id: 'text-counter',
    name: '文本计数器',
    description: '输入文本后统计字符数和非空词数，适合快速校对。',
    status: 'active',
    launchMode: 'inline',
    Component: TextCounterPage,
  },
]

export const getCategoryById = (categoryId: string) => categories.find((category) => category.id === categoryId)

export const getToolById = (toolId: string) => tools.find((tool) => tool.id === toolId)

export const getToolsByCategory = (categoryId: string) =>
  tools.filter((tool) => tool.categoryId === categoryId && tool.launchMode === 'page')

export const getDirectTools = () => tools.filter((tool) => !tool.categoryId || tool.launchMode === 'inline')

export const getCategoryPath = (categoryId: string) => `/categories/${categoryId}`

export const getToolPath = (toolId: string) => `/tools/${toolId}`
