import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

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
  })

  const fornitore = docs[0]
  if (!fornitore) return notFound()

  return (
    <div>
      <h1>{fornitore.nomeAzienda}</h1>
      <p>
        {fornitore.contattoNome} {fornitore.contattoCognome}
      </p>
      <p>{fornitore.telefono}</p>
      <p>{fornitore.email}</p>
    </div>
  )
}
