'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'

const CondominioPdfDownload: UIFieldClientComponent = () => {
  const { id } = useDocumentInfo()
  const rawID = id === null || id === undefined ? null : String(id)
  const documentID = rawID && rawID !== 'create' ? rawID : null

  if (!documentID) {
    return (
      <div className="condominio-pdf-download">
        <p className="condominio-pdf-download__hint">
          Salva prima il condominio per abilitare il download del PDF.
        </p>
      </div>
    )
  }

  return (
    <div className="condominio-pdf-download">
      <a
        className="condominio-pdf-download__button"
        href={`/condomini/${documentID}/pdf`}
        rel="noopener noreferrer"
        target="_blank"
      >
        Download PDF fornitori
      </a>
      <p className="condominio-pdf-download__hint">
        Il PDF si apre in una nuova tab e puoi scaricarlo da lì.
      </p>
    </div>
  )
}

export default CondominioPdfDownload
