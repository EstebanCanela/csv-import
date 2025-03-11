import { Module } from '@nestjs/common';
import { ContactsController } from './infrastructure/inbound/controllers/contacts.controller';
import CreateFileUseCase from './application/usecases/presigned-url.usecase';
import StorageAdapter from './infrastructure/outbound/adapters/storage.adapter';
import ProcessFileUseCase from './application/usecases/process-file.usecase';
import FilesAdapter from './infrastructure/outbound/adapters/files.adapter';
import { CommonModule } from '../common/common.module';
import ExportFileUseCase from './application/usecases/export-file.usecase';
import QueueAdapter from './infrastructure/outbound/adapters/queue.adapter';
import ContactsAdapter from './infrastructure/outbound/adapters/contacts.adapter';
import { CreateContactQueueHandler } from './infrastructure/inbound/handlers/create-contact.handler';
import CreateContactUseCase from './application/usecases/create-contact.usecase';
import GetContactsUseCase from './application/usecases/get-contacts.usecase';

@Module({
  imports: [CommonModule],
  controllers: [ContactsController],
  providers: [
    CreateFileUseCase,
    StorageAdapter,
    ProcessFileUseCase,
    FilesAdapter,
    ExportFileUseCase,
    QueueAdapter,
    ContactsAdapter,
    CreateContactQueueHandler,
    GetContactsUseCase,
    CreateContactUseCase,
  ],
})
export class ContactsModule {}
