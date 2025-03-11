CREATE INDEX "public_id_contacts_idx" ON "contacts" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "email_idx" ON "contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "status_file_id_idx" ON "contacts" USING btree ("status","file_id");--> statement-breakpoint
CREATE INDEX "public_id_idx" ON "files" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "files" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "status_public_id_idx" ON "files" USING btree ("status","public_id");