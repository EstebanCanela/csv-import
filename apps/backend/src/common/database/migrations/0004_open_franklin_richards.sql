ALTER TABLE "files" ALTER COLUMN "filename" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "public_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "public_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "user_id" SET NOT NULL;