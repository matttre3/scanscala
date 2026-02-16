import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

export default async function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute -left-24 top-[-80px] h-64 w-64 rounded-full bg-emerald-200/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-8 h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10 sm:px-6">
        <section className="w-full max-w-2xl rounded-[28px] border border-slate-200/80 bg-white/95 p-7 text-center shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur sm:p-10 sm:pt-0" >
          <Image
            alt="ScanScala"
            className="mx-auto h-auto w-[250px] max-w-full sm:w-[300px]"
            height={94}
            priority
            src="/brand/logo-scanscala.png"
            width={300}
          />

          <h1 className="text-3xl -mt-[40px] font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Gestione fornitori condominiali via QR
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            Crea fornitori, associa i condomini e genera PDF pronti da stampare con QR code e contatti
            essenziali.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
              href="/admin"
            >
              Vai al pannello admin
            </Link>
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-slate-400">
            scanscala · semplice · rapido · stampabile
          </p>
        </section>
      </div>
    </div>
  )
}
