import type { CollectionConfig, Payload } from 'payload'
import slugify from 'slugify'

export const supplierTypeIconOptions = [
  { label: 'Fulmine', value: 'bolt' },
  { label: 'Edificio', value: 'building' },
  { label: 'Goccia', value: 'droplet' },
  { label: 'Ascensore', value: 'elevator' },
  { label: 'Chiave inglese', value: 'wrench' },
  { label: 'Fiamma', value: 'flame' },
  { label: 'Spurghi', value: 'drain' },
  { label: 'Chiave', value: 'key' },
  { label: 'Scudo', value: 'shield' },
  { label: 'Pulizie', value: 'broom' },
  { label: 'Giardino', value: 'tree' },
  { label: 'Telefono', value: 'phone' },
  { label: 'Generico', value: 'tag' },
]

export const supplierTypeColorOptions = [
  { label: 'Verde', value: 'emerald' },
  { label: 'Ambra', value: 'amber' },
  { label: 'Blu', value: 'blue' },
  { label: 'Viola', value: 'violet' },
  { label: 'Rosso', value: 'red' },
  { label: 'Azzurro', value: 'sky' },
  { label: 'Grigio', value: 'slate' },
  { label: 'Arancio', value: 'orange' },
  { label: 'Teal', value: 'teal' },
]

export const defaultSupplierTypes = [
  { nome: 'Elettricista', icon: 'bolt', color: 'amber' },
  { nome: 'Impresa Edile', icon: 'building', color: 'orange' },
  { nome: 'Idraulico', icon: 'droplet', color: 'blue' },
  { nome: 'Ascensorista', icon: 'elevator', color: 'violet' },
  { nome: 'Manutentore', icon: 'wrench', color: 'emerald' },
  { nome: 'Caldaista', icon: 'flame', color: 'red' },
  { nome: 'Spurghi', icon: 'drain', color: 'sky' },
  { nome: 'Fabbro', icon: 'key', color: 'slate' },
  { nome: 'Amministratore', icon: 'shield', color: 'teal' },
] as const

const legacyTypeAliases: Record<string, string> = {
  caldaia: 'Caldaista',
  caldaista: 'Caldaista',
  'impresa edile': 'Impresa Edile',
}

const normalizeTypeName = (value: string) => value.trim().toLowerCase()

export const TipologieFornitori: CollectionConfig = {
  slug: 'tipologie-fornitori',
  labels: {
    singular: 'Tipologia Fornitore',
    plural: 'Tipologie Fornitori',
  },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'icon', 'color', 'updatedAt'],
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'icon',
      type: 'select',
      options: supplierTypeIconOptions,
      required: true,
      defaultValue: 'tag',
    },
    {
      name: 'color',
      type: 'select',
      options: supplierTypeColorOptions,
      required: true,
      defaultValue: 'emerald',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        if (data.nome && !data.slug) {
          data.slug = slugify(data.nome, { lower: true, strict: true })
        }
        return data
      },
    ],
  },
}

export async function seedTipologieFornitori(payload: Payload) {
  const typeDocs = new Map<string, number>()

  for (const supplierType of defaultSupplierTypes) {
    const slug = slugify(supplierType.nome, { lower: true, strict: true })
    const existing = await payload.find({
      collection: 'tipologie-fornitori',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })

    const doc =
      existing.docs[0] ??
      (await payload.create({
        collection: 'tipologie-fornitori',
        data: {
          ...supplierType,
          slug,
        },
      }))

    typeDocs.set(normalizeTypeName(supplierType.nome), doc.id)
  }

  const legacySuppliers = await payload.find({
    collection: 'fornitori',
    where: {
      and: [
        {
          or: [{ tipologia: { exists: false } }, { tipologia: { equals: null } }],
        },
        { type: { exists: true } },
      ],
    },
    limit: 1000,
    depth: 0,
  })

  await Promise.all(
    legacySuppliers.docs.map(async (supplier) => {
      if (!supplier.type) return
      const normalizedType = normalizeTypeName(supplier.type)
      const canonicalType = legacyTypeAliases[normalizedType] ?? supplier.type
      const tipologiaID = typeDocs.get(normalizeTypeName(canonicalType))
      if (!tipologiaID) return

      await payload.update({
        collection: 'fornitori',
        id: supplier.id,
        data: { tipologia: tipologiaID },
        context: { skipQR: true },
      })
    }),
  )
}
