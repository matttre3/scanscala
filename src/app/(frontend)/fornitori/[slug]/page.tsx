import { notFound } from 'next/navigation'
import { Fira_Code, Space_Grotesk } from 'next/font/google'
import { getPayload } from 'payload'
import type { ReactNode } from 'react'
import config from '@payload-config'
import { getSupplierTypeDisplay } from '@/lib/supplierTypeDisplay'

export const dynamic = 'force-dynamic'

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
    slug: string
  }>
}

export default async function FornitorePage({ params }: PageArgs) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'fornitori',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const fornitore = docs[0]
  if (!fornitore) return notFound()
  const typeDisplay = getSupplierTypeDisplay(fornitore)

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
                <div className="flex items-center justify-between gap-3">
                  <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-slate-500">
                    Scheda Fornitore
                  </p>
                  <TypeBadge color={typeDisplay.color} iconName={typeDisplay.icon} text={typeDisplay.name} />
                </div>
                <h1 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                  {fornitore.nomeAzienda}
                </h1>
              </header>

              <section className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <InfoCard
                  color={typeDisplay.color}
                  icon={<TypeIcon iconName={typeDisplay.icon} />}
                  label="Tipo"
                  value={typeDisplay.name}
                />
                <InfoCard
                  icon={<UserIcon />}
                  label="Referente"
                  value={`${fornitore.contattoNome} ${fornitore.contattoCognome}`}
                />
                <InfoCard
                  icon={<PhoneIcon />}
                  label="Telefono"
                  value={
                    <a
                      className="underline decoration-dotted decoration-slate-300 underline-offset-4 hover:text-emerald-700"
                      href={`tel:${fornitore.telefono}`}
                    >
                      {fornitore.telefono}
                    </a>
                  }
                />
                <InfoCard
                  icon={<MailIcon />}
                  label="Email"
                  value={
                    <a
                      className="break-all underline decoration-dotted decoration-slate-300 underline-offset-4 hover:text-emerald-700"
                      href={`mailto:${fornitore.email}`}
                    >
                      {fornitore.email}
                    </a>
                  }
                />
              </section>
            </article>
          </div>
        </div>
        <a
          className="fixed bottom-3 right-3 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 font-[var(--font-mono)] text-[10px] text-slate-500 shadow-sm transition hover:text-slate-700"
          href="https://matteoromano.dev"
          rel="noreferrer"
          target="_blank"
        >
          made with ♥ by matteoromano.dev
        </a>
      </div>
    </div>
  )
}

function InfoCard({
  color = 'emerald',
  icon,
  label,
  value,
}: {
  color?: string
  icon: ReactNode
  label: string
  value: ReactNode
}) {
  const colorClass = getTypeColorClass(color)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${colorClass}`}>
        {icon}
      </span>
      <div className="min-w-0 space-y-0.5">
        <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-slate-500">
          {label}
        </span>
        <div className="text-sm font-medium leading-tight text-slate-900 break-words sm:text-base">
          {value}
        </div>
      </div>
    </div>
  )
}

function TypeBadge({ color, iconName, text }: { color: string; iconName: string; text: string }) {
  const colorClass = getTypeBadgeClass(color)

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${colorClass}`}>
      <TypeIcon iconName={iconName} />
      <span className="max-w-28 truncate sm:max-w-none">{text}</span>
    </span>
  )
}

function TypeIcon({ iconName }: { iconName: null | string | undefined }) {
  switch (iconName) {
    case 'bolt':
      return <BoltIcon />
    case 'building':
      return <CraneIcon />
    case 'droplet':
      return <DropletIcon />
    case 'elevator':
      return <ElevatorIcon />
    case 'wrench':
      return <WrenchIcon />
    case 'flame':
      return <FlameIcon />
    case 'drain':
      return <DrainIcon />
    case 'key':
      return <KeyIcon />
    case 'shield':
      return <ShieldIcon />
    case 'broom':
      return <BroomIcon />
    case 'tree':
      return <TreeIcon />
    case 'phone':
      return <PhoneIcon />
    default:
      return <TagIcon />
  }
}

function getTypeColorClass(color: string) {
  const classes: Record<string, string> = {
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    orange: 'border-orange-100 bg-orange-50 text-orange-700',
    red: 'border-red-100 bg-red-50 text-red-700',
    sky: 'border-sky-100 bg-sky-50 text-sky-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    teal: 'border-teal-100 bg-teal-50 text-teal-700',
    violet: 'border-violet-100 bg-violet-50 text-violet-700',
  }

  return classes[color] ?? classes.emerald
}

function getTypeBadgeClass(color: string) {
  const classes: Record<string, string> = {
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    teal: 'border-teal-200 bg-teal-50 text-teal-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
  }

  return classes[color] ?? classes.emerald
}

function UserIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 5.5c0-.83.67-1.5 1.5-1.5h2.1c.64 0 1.2.4 1.42 1.01l.8 2.22c.2.56.05 1.18-.38 1.59l-1.12 1.07a13.2 13.2 0 006.91 6.91l1.07-1.12c.41-.43 1.03-.58 1.59-.38l2.22.8c.61.22 1.01.78 1.01 1.42v2.1c0 .83-.67 1.5-1.5 1.5H18c-7.73 0-14-6.27-14-14V5.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 6h16c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2zm0 0l8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13 2L5 13h5l-1 9 8-11h-5l1-9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CraneIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 21h16M6 21V6h8M10 6V3M10 9h6M16 9v4m0 0h2m-2 0l-2 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DropletIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3s6 6.5 6 10a6 6 0 11-12 0c0-3.5 6-10 6-10zm-2 10a2 2 0 002 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ElevatorIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 3h12v18H6V3zm4 6l2-2 2 2m-4 6l2 2 2-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 7a4 4 0 005 5l-8 8a2 2 0 11-3-3l8-8a4 4 0 01-2-2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3s4 3 4 7a4 4 0 01-8 0c0-2 1-4 4-7zm0 7c3 2 5 4 5 7a5 5 0 11-10 0c0-3 2-5 5-7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DrainIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 8h16M6 8l2 10h8l2-10M10 12h4m-3 3h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 14l6-6m-2 0h2v2m-9 4a4 4 0 11-5.7-5.7A4 4 0 0111 14z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3zm0 6a2 2 0 100 4 2 2 0 000-4zm-3 8a3 3 0 016 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BroomIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16 3l5 5M14 5l5 5M13 8l3 3-8 9H4l9-12zm-5 12l-4-4m2 2l3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TreeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21v-6M8 17h8M12 3l5 7h-3l4 5H6l4-5H7l5-7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 10V4h6l9 9-6 6-9-9zm4-3a1 1 0 100 2 1 1 0 000-2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
