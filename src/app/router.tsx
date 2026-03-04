import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import HomePage from '../tools/home/pages/HomePage'
import NotFoundPage from '../tools/not-found/pages/NotFoundPage'
import { tools } from '../tools'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      ...tools.map((tool) => ({
        path: tool.path,
        element: <tool.Component />,
      })),
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const appRouter = createBrowserRouter(appRoutes)
