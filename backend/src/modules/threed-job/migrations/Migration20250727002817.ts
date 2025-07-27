import { Migration } from '@mikro-orm/migrations';

export class Migration20250727002817 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "threed_job" ("id" text not null, "session_id" text null, "user_id" text null, "username" text null, "ip_address" text not null, "status" text check ("status" in ('pending', 'processing', 'completed', 'failed')) not null default 'pending', "prediction_id" text null, "model_url" text null, "original_model_url" text null, "uploaded_images" jsonb null, "compression_stats" jsonb null, "processing_time" integer null, "error_message" text null, "synexa_data" jsonb null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "threed_job_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_threed_job_deleted_at" ON "threed_job" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "threed_job" cascade;`);
  }

}
