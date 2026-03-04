import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import { appRoutes } from './router'

const renderWithPath = (path: string) => {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [path],
  })

  return render(<RouterProvider router={router} />)
}

describe('app routing', () => {
  test('renders overview page', async () => {
    renderWithPath('/')
    expect(await screen.findByRole('heading', { name: '分类总览' })).toBeInTheDocument()
  })

  test('renders image category page with tools', async () => {
    renderWithPath('/categories/image')
    expect(await screen.findByRole('heading', { name: '图片' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: '图片文本编辑' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: '图片色彩编辑' })).toBeInTheDocument()
  })

  test('renders image text tool page', async () => {
    renderWithPath('/tools/image-text-edit')
    expect(await screen.findByRole('heading', { name: '图片文本编辑' })).toBeInTheDocument()
  })

  test('renders direct tool page without category', async () => {
    renderWithPath('/tools/text-counter')
    expect(await screen.findByRole('heading', { name: '文本计数器' })).toBeInTheDocument()
  })

  test('renders not found for unknown route', async () => {
    renderWithPath('/not-exist')
    expect(await screen.findByRole('heading', { name: '页面不存在' })).toBeInTheDocument()
  })
})
