CREATE TYPE "public"."contacts_status" AS ENUM('SUCCESS', 'ERROR');--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid(),
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text NOT NULL,
	"file_id" integer,
	"status" "contacts_status" NOT NULL,
	"error" text,
	CONSTRAINT "contacts_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text,
	"public_id" uuid DEFAULT gen_random_uuid(),
	"url" text,
	CONSTRAINT "files_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;