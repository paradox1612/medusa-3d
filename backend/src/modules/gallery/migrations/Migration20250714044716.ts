import { Migration } from '@mikro-orm/migrations';

export class Migration20250714044716 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "gallery_upload" ("id" text not null, "image_url" text not null, "title" text null, "description" text null, "status" text not null default 'pending', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "gallery_upload_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_gallery_upload_deleted_at" ON "gallery_upload" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "gallery_upload" cascade;`);
  }

}
