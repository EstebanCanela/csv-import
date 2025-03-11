import { InferModel } from 'drizzle-orm';
import {
  integer,
  serial,
  text,
  pgTable,
  uuid,
  jsonb,
  bigint,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';

export const contacts = pgTable(
  'contacts',
  {
    id: serial('id').primaryKey(),
    publicId: uuid('public_id').defaultRandom().unique(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    email: text('email').notNull(),
    fileId: integer('file_id').references(() => files.id),
    status: text('status').notNull(),
    error: text('error'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('public_id_contacts_idx').on(table.publicId),
    index('email_idx').on(table.email),
    index('status_file_id_idx').on(table.status, table.fileId),
  ],
);

export const files = pgTable(
  'files',
  {
    id: serial('id').primaryKey(),
    filename: text('filename').notNull(),
    numberOfRows: bigint('number_of_rows', { mode: 'number' }),
    fileType: text('file_type'),
    fileSize: numeric('file_size', { precision: 100, scale: 3 }),
    status: text('status').notNull(),
    publicId: uuid('public_id').unique().notNull(),
    userId: uuid('user_id').notNull(),
    configuration: jsonb('configuration'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('public_id_idx').on(table.publicId),
    index('user_id_idx').on(table.userId),
    index('status_public_id_idx').on(table.status, table.publicId),
  ],
);

export const filesInsertSchema = createInsertSchema(files);
export const filesUpdateSchema = createUpdateSchema(files);
export const filesSelectSchema = createSelectSchema(files);
export type Files = typeof files.$inferSelect;

export const contactsInsertSchema = createInsertSchema(contacts);
export const contactsUpdateSchema = createUpdateSchema(contacts);
export const contactsSelectSchema = createSelectSchema(contacts);
export const contactsArrayInsertSchema = z.array(contactsInsertSchema);
export type Contacts = typeof contacts.$inferSelect;
