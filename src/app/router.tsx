import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import CategoryPage from '../tools/category/pages/CategoryPage'
import NotFoundPage from '../tools/not-found/pages/NotFoundPage'
import OverviewPage from '../tools/overview/pages/OverviewPage'
import ToolRoutePage from '../tools/tool-route/pages/ToolRoutePage'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <OverviewPage />,
      },
      {
        path: 'categories/:categoryId',
        element: <CategoryPage />,
      },
      {
        path: 'tools/:toolId',
        element: <ToolRoutePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const appRouter = createBrowserRouter(appRoutes)
