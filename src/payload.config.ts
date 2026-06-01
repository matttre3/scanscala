import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Condomini } from './collections/Condomini'
import { Fornitori } from './collections/Fornitori'
import { TipologieFornitori, seedTipologieFornitori } from './collections/TipologieFornitori'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Icon: '/components/admin/BrandIcon',
        Logo: '/components/admin/BrandLogo',
      },
    },
  },
  collections: [Users, Media, TipologieFornitori, Fornitori, Condomini],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  onInit: async (payload) => {
    if (process.env.NEXT_PHASE === 'phase-production-build') return

    await seedTipologieFornitori(payload).catch((error) => {
      payload.logger.warn(`Seed tipologie fornitori non completato: ${error.message}`)
    })
  },
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
