import { Migration } from '@mikro-orm/migrations'

/**
 * Creates the `review` table for the Review module. Hand-written to match
 * models/review.ts so the module is runnable after `medusa db:migrate` without
 * a separate `db:generate` step. (Re-running `db:generate review` later will
 * pick up from here.)
 */
export class Migration20260610000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "review" (
        "id" text NOT NULL,
        "product_id" text NOT NULL,
        "customer_id" text NULL,
        "email" text NOT NULL,
        "author_name" text NOT NULL,
        "rating" integer NOT NULL,
        "title" text NULL,
        "content" text NOT NULL,
        "images" jsonb NULL,
        "status" text CHECK ("status" IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
        "verified" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "review_pkey" PRIMARY KEY ("id")
      );
    `)
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_review_product_id" ON "review" ("product_id") WHERE "deleted_at" IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_review_status" ON "review" ("status") WHERE "deleted_at" IS NULL;`,
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_review_deleted_at" ON "review" ("deleted_at") WHERE "deleted_at" IS NOT NULL;`,
    )
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "review" CASCADE;`)
  }
}
