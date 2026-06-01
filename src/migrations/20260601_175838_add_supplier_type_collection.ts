import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_tipologie_fornitori_icon" AS ENUM(
        'bolt',
        'building',
        'droplet',
        'elevator',
        'wrench',
        'flame',
        'drain',
        'key',
        'shield',
        'broom',
        'tree',
        'phone',
        'tag'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_tipologie_fornitori_color" AS ENUM(
        'emerald',
        'amber',
        'blue',
        'violet',
        'red',
        'sky',
        'slate',
        'orange',
        'teal'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "tipologie_fornitori" (
      "id" serial PRIMARY KEY NOT NULL,
      "nome" varchar NOT NULL,
      "icon" "enum_tipologie_fornitori_icon" DEFAULT 'tag' NOT NULL,
      "color" "enum_tipologie_fornitori_color" DEFAULT 'emerald' NOT NULL,
      "slug" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "fornitori"
      ADD COLUMN IF NOT EXISTS "tipologia_id" integer;

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "tipologie_fornitori_id" integer;

    DO $$ BEGIN
      ALTER TABLE "fornitori"
        ADD CONSTRAINT "fornitori_tipologia_id_tipologie_fornitori_id_fk"
        FOREIGN KEY ("tipologia_id") REFERENCES "public"."tipologie_fornitori"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_tipologie_fornitori_fk"
        FOREIGN KEY ("tipologie_fornitori_id") REFERENCES "public"."tipologie_fornitori"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "tipologie_fornitori_nome_idx"
      ON "tipologie_fornitori" USING btree ("nome");
    CREATE UNIQUE INDEX IF NOT EXISTS "tipologie_fornitori_slug_idx"
      ON "tipologie_fornitori" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "tipologie_fornitori_updated_at_idx"
      ON "tipologie_fornitori" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "tipologie_fornitori_created_at_idx"
      ON "tipologie_fornitori" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "fornitori_tipologia_idx"
      ON "fornitori" USING btree ("tipologia_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tipologie_fornitori_id_idx"
      ON "payload_locked_documents_rels" USING btree ("tipologie_fornitori_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_tipologie_fornitori_fk";
    ALTER TABLE "fornitori"
      DROP CONSTRAINT IF EXISTS "fornitori_tipologia_id_tipologie_fornitori_id_fk";

    DROP INDEX IF EXISTS "payload_locked_documents_rels_tipologie_fornitori_id_idx";
    DROP INDEX IF EXISTS "fornitori_tipologia_idx";
    DROP INDEX IF EXISTS "tipologie_fornitori_created_at_idx";
    DROP INDEX IF EXISTS "tipologie_fornitori_updated_at_idx";
    DROP INDEX IF EXISTS "tipologie_fornitori_slug_idx";
    DROP INDEX IF EXISTS "tipologie_fornitori_nome_idx";

    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "tipologie_fornitori_id";
    ALTER TABLE "fornitori"
      DROP COLUMN IF EXISTS "tipologia_id";

    DROP TABLE IF EXISTS "tipologie_fornitori";
    DROP TYPE IF EXISTS "public"."enum_tipologie_fornitori_color";
    DROP TYPE IF EXISTS "public"."enum_tipologie_fornitori_icon";
  `)
}
