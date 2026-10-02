import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { SearchForm } from '@/components/SearchForm'
import { SITE } from '@/lib/site'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s · ${SITE.title}` },
  description: SITE.description,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-rule">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
            <Link href="/" className="inline-flex min-h-11 items-center text-lg font-semibold">
              {SITE.title}
            </Link>
            <nav className="flex gap-4 text-muted">
              <Link href="/glossary" className="inline-flex min-h-11 items-center hover:text-foreground">
                Glossary
              </Link>
              <a href={SITE.portfolio} className="inline-flex min-h-11 items-center hover:text-foreground">
                Portfolio
              </a>
            </nav>
            <SearchForm className="w-full" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">{children}</main>
        <footer className="border-t border-rule">
          <p className="mx-auto max-w-4xl px-4 py-6 text-sm text-muted">
            © {SITE.author}. The content is copyright; the code is{' '}
            <a className="underline" href={SITE.repo}>
              open source
            </a>
            . JSON API at <code>/api/search</code> and <code>/api/terms</code>.
          </p>
        </footer>
      </body>
    </html>
  )
}
