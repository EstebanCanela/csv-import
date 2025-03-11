import { ContactModel } from '../../../domain/models/contact.model';

export default interface ContactsPort {
  createContacts(contacts: Partial<ContactModel>[]): Promise<void>;

  seekContacts(
    userId: string,
    pageSize: number,
    lastId?: number,
    lastCreatedAt?: Date,
  ): Promise<ContactModel[]>;
}
