ALTER TABLE "contacts" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "file_extension";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "url";--> statement-breakpoint
DROP TYPE "public"."contacts_status";