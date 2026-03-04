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
  test('renders home page with toolbox title', async () => {
    renderWithPath('/')
    expect(await screen.findByRole('heading', { name: 'WebToolbox' })).toBeInTheDocument()
  })

  test('renders image editor page', async () => {
    renderWithPath('/tools/image-editor')
    expect(await screen.findByRole('heading', { name: '图片编辑' })).toBeInTheDocument()
  })

  test('renders not found for unknown route', async () => {
    renderWithPath('/not-exist')
    expect(await screen.findByRole('heading', { name: '页面不存在' })).toBeInTheDocument()
  })
})
