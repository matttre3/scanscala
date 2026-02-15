import type { CollectionConfig } from 'payload'
import QRCode from 'qrcode'
import slugify from 'slugify'

export const Fornitori: CollectionConfig = {
  slug: 'fornitori',
  admin: {
    useAsTitle: 'nomeAzienda',
    defaultColumns: ['nomeAzienda', 'contattoNome', 'contattoCognome', 'telefono', 'email'],
  },
  fields: [
    { name: 'nomeAzienda', type: 'text', required: true },
    { name: 'contattoNome', type: 'text', required: true },
    { name: 'contattoCognome', type: 'text', required: true },
    { name: 'telefono', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    {
      name: 'qrLink',
      type: 'text',
      required: false,
      admin: { description: 'URL del QR' },
    },
    {
      name: 'qrImage',
      type: 'upload',
      relationTo: 'media',
      required: false,
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
      ({ data, originalDoc }) => {
        if (!data) return data
        const nome = data.nomeAzienda ?? originalDoc?.nomeAzienda
        if (nome && (!data.slug || data.slug === originalDoc?.slug)) {
          data.slug = slugify(nome, { lower: true, strict: true })
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, context, operation }) => {
        if (context.skipQR) return doc
        if (operation !== 'create') return doc
        if (doc.qrImage) return doc

        const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const qrLink = `${baseURL}/fornitori/${doc.slug}`

        const buffer = await QRCode.toBuffer(qrLink, { type: 'png' })

        const media = await req.payload.create({
          collection: 'media',
          data: { alt: `QR ${doc.nomeAzienda}` },
          file: {
            data: buffer,
            name: `${doc.slug}.png`,
            mimetype: 'image/png',
            size: buffer.length,
          },
          req,
        })

        await req.payload.update({
          collection: 'fornitori',
          id: doc.id,
          data: { qrLink, qrImage: media.id },
          context: { skipQR: true },
          req,
        })

        return doc
      },
    ],
  },
}
