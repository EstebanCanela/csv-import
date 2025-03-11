ALTER TYPE "public"."contacts_status" ADD VALUE 'IN_PROGRESS' BEFORE 'ERROR';--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "number_of_rows" bigint;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "file_type" text;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "file_extension" text;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "file_size" numeric(100, 3);--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "configuration" jsonb;