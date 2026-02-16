import type { CollectionConfig } from 'payload'

export const Condomini: CollectionConfig = {
  slug: 'condomini',
  labels: {
    singular: 'Condominio',
    plural: 'Condomini',
  },
  admin: {
    useAsTitle: 'nomeCondominio',
    defaultColumns: ['nomeCondominio', 'fornitori', 'updatedAt'],
  },
  fields: [
    {
      name: 'nomeCondominio',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'fornitori',
      type: 'relationship',
      relationTo: 'fornitori',
      hasMany: true,
      required: true,
    },
    {
      name: 'downloadPdf',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/components/admin/CondominioPdfDownload',
        },
      },
    },
  ],
}
