import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../../../../constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../common/database/schema';

import ContactsPort from '../../../application/ports/files/contacts.port';
import {
  ContactModel,
  ContactStatus,
} from '../../../domain/models/contact.model';
import { contactsArrayInsertSchema } from '../../../../common/database/schema';
import { and, eq, asc, gt } from 'drizzle-orm';

@Injectable()
export default class ContactsAdapter implements ContactsPort {
  constructor(
    @Inject(PG_CONNECTION) private conn: NodePgDatabase<typeof schema>,
  ) {}

  async createContacts(contacts: Partial<ContactModel>[]): Promise<void> {
    const values = contactsArrayInsertSchema.parse(contacts);

    await this.conn.transaction(async (tx) =>
      tx.insert(schema.contacts).values(values),
    );

    return;
  }

  async seekContacts(
    userId: string,
    pageSize = 20,
    lastId?: number,
    lastCreatedAt?: Date,
  ): Promise<ContactModel[]> {
    let conditions = [eq(schema.files.userId, userId)];

    if (lastId && lastCreatedAt) {
      conditions = [
        gt(schema.contacts.id, lastId),
        gt(schema.contacts.createdAt, lastCreatedAt),
      ];
    }

    const result = await this.conn
      .select({
        id: schema.contacts.id,
        publicId: schema.contacts.publicId,
        firstName: schema.contacts.firstName,
        lastName: schema.contacts.lastName,
        email: schema.contacts.email,
        fileId: schema.contacts.fileId,
        status: schema.contacts.status,
        error: schema.contacts.error,
        createdAt: schema.contacts.createdAt,
        updatedAt: schema.contacts.updatedAt,
      })
      .from(schema.contacts)
      .innerJoin(schema.files, eq(schema.contacts.fileId, schema.files.id))
      .orderBy(asc(schema.contacts.id), asc(schema.contacts.createdAt))
      .where(and(...conditions))
      .limit(Number(pageSize));

    if (!result.length) {
      return [];
    }

    return result.map((row) => ({
      id: row.id,
      publicId: row.publicId || '',
      firstName: row.firstName,
      lastName: row.lastName || '',
      email: row.email,
      fileId: row.fileId || 0,
      status: row.status as ContactStatus,
      error: row.error,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }
}
