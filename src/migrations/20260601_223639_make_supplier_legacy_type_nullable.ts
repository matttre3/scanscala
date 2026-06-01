import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "fornitori"
      ALTER COLUMN "type" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "fornitori"
      SET "type" = 'Amministratore'
      WHERE "type" IS NULL;

    ALTER TABLE "fornitori"
      ALTER COLUMN "type" SET NOT NULL;
  `)
}
