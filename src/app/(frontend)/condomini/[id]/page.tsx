import type { Fornitori } from '@/payload-types'
import config from '@payload-config'
import { Fira_Code, Space_Grotesk } from 'next/font/google'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

const primaryFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
})

const monoFont = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

type PageArgs = {
  params: Promise<{
    id: string
  }>
}

export default async function CondominioPage({ params }: PageArgs) {
  const { id } = await params
  const payload = await getPayload({ config })

  const condominio = await payload
    .findByID({
      collection: 'condomini',
      id,
      depth: 1,
    })
    .catch(() => null)

  if (!condominio) return notFound()

  const fornitori = (condominio.fornitori ?? []).filter(
    (fornitore): fornitore is Fornitori => typeof fornitore !== 'number',
  )

  return (
    <div
      className={`${primaryFont.variable} ${monoFont.variable} min-h-screen bg-slate-50 text-slate-900`}
    >
      <div className="relative isolate min-h-screen overflow-hidden font-[var(--font-body)]">
        <div
          className="pointer-events-none absolute -top-24 left-[-15%] h-72 w-72 rounded-full bg-emerald-200/70 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-[-10%] top-[-60px] h-80 w-80 rounded-full bg-amber-200/70 blur-3xl"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.06),transparent_46%)]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-5 sm:px-6 sm:py-8">
          <div className="w-full rounded-[28px] bg-gradient-to-br from-white via-white to-slate-100 p-[1px] shadow-[0_26px_60px_rgba(15,23,42,0.12)]">
            <article className="rounded-[27px] border border-slate-200/70 bg-white/95 p-4 backdrop-blur md:p-6">
              <header className="space-y-2">
                <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Scheda Condominio
                </p>
                <h1 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                  {condominio.nomeCondominio || `Condominio #${condominio.id}`}
                </h1>
              </header>

              <section className="mt-4 space-y-2.5">
                {fornitori.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                    Nessun fornitore associato a questo condominio.
                  </div>
                ) : (
                  fornitori.map((fornitore) => (
                    <div
                      key={fornitore.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                          {fornitore.nomeAzienda || `Fornitore #${fornitore.id}`}
                        </p>
                        <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-slate-500">
                          {fornitore.type || 'Tipo non disponibile'}
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                        QR
                      </span>
                    </div>
                  ))
                )}
              </section>

              <footer className="mt-4 border-t border-slate-200 pt-4">
                <a
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                  href={`/condomini/${condominio.id}/pdf`}
                >
                  Download PDF fornitori
                </a>
              </footer>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
