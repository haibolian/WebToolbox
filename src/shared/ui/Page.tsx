import type { ReactNode } from 'react'

type PageProps = {
  title: string
  description?: string
  children?: ReactNode
}

export default function Page({ title, description, children }: PageProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-slate-400">{description}</p> : null}
      </header>
      {children}
    </section>
  )
}
