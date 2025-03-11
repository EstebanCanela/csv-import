import { Injectable } from '@nestjs/common';
import FilesAdapter from '../../infrastructure/outbound/adapters/files.adapter';
import ContactsAdapter from '../../infrastructure/outbound/adapters/contacts.adapter';
import {
  ContactOutputCommand,
  GetContactsInputCommand,
  GetContactsOutputCommand,
} from '../commands/get-contacts.command';
import { decodeBase64, encodeBase64 } from '../../utils/base64';
import { ContactModel } from '../../domain/models/contact.model';

@Injectable()
export default class GetContactsUseCase {
  constructor(
    private readonly contactsAdapter: ContactsAdapter,
    private readonly filesAdapter: FilesAdapter,
  ) {}

  async execute(
    input: GetContactsInputCommand,
  ): Promise<GetContactsOutputCommand> {
    let cursor, lastId, lastCreatedAt;
    let pageSize = input.pageSize || 20;

    if (input.cursor) {
      cursor = decodeBase64(input.cursor);
      lastId = cursor.id;
      lastCreatedAt = cursor.createdAt ? new Date(cursor.createdAt) : undefined;
      pageSize = cursor.pageSize;
    }

    const file = await this.filesAdapter.getByUserId(input.userId);

    const contacts = await this.contactsAdapter.seekContacts(
      input.userId,
      pageSize,
      lastId,
      lastCreatedAt,
    );

    const lastItem = contacts[contacts.length - 1];
    const nextCursor = lastItem
      ? {
          id: lastItem.id,
          createdAt: lastItem.createdAt,
          pageSize,
        }
      : null;

    return {
      status: file?.status || 'IN_PROGRESS',
      data: this.mapContactsModelToCommand(contacts),
      page: {
        cursor: nextCursor ? encodeBase64(nextCursor) : null,
        totalOfRows: file?.numberOfRows || 0,
        size: pageSize,
      },
    };
  }

  private mapContactsModelToCommand(
    contacts: ContactModel[],
  ): ContactOutputCommand[] {
    return contacts.map((contact) => ({
      id: contact.publicId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      status: contact.status,
      error: contact.error,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }));
  }
}
