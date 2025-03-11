import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ConfigurationModel } from '../../domain/models/file.model';
import {
  CreateContactFile,
  CreateContactInputCommand,
} from '../commands/create-contact.command';
import {
  ContactModel,
  ContactSchemaValidator,
  ContactStatus,
} from '../../domain/models/contact.model';
import ContactsAdapter from '../../infrastructure/outbound/adapters/contacts.adapter';
import StorageAdapter from '../../infrastructure/outbound/adapters/storage.adapter';

@Injectable()
export default class CreateContactUseCase {
  constructor(
    private readonly contactsAdapter: ContactsAdapter,
    private readonly storageAdapter: StorageAdapter,
  ) {}

  async execute(input: CreateContactInputCommand): Promise<void> {
    try {
      if (input.batch) {
        const batchMapped = await this.mapBatchToContacts(
          input.file,
          input.batch,
          (input.file?.configuration || []) as unknown as ConfigurationModel[],
        );

        this.contactsAdapter.createContacts(batchMapped);
      }

      return;
    } catch (err) {
      console.log(err);
    }
  }

  private async mapBatchToContacts(
    file: CreateContactFile,
    batch: Record<string, unknown>[],
    configuration: ConfigurationModel[],
  ) {
    const batchMapped = batch.map((row) => {
      const newContact: Partial<ContactModel> = {
        publicId: uuidv4(),
        fileId: file.id || 0,
        status: ContactStatus.SUCCESS,
      };
      configuration.forEach((element) => {
        newContact[element.internal] = row[element.value];
      });

      const result = ContactSchemaValidator.safeParse(newContact);

      if (!result.success) {
        newContact.status = ContactStatus.ERROR;
        newContact.error = JSON.stringify(result.error);
      }

      return newContact;
    });

    return batchMapped;
  }
}
