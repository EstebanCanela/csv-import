import { Injectable } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import config from 'config/config';

import { CreateContactInputCommand } from '../../../application/commands/create-contact.command';
import CreateContactUseCase from '../../../application/usecases/create-contact.usecase';

@Injectable()
export class CreateContactQueueHandler {
  constructor(private readonly createContactUseCase: CreateContactUseCase) {}

  @SqsMessageHandler(config().queue.createContactQueueName, false)
  async handleMessage(message: Message) {
    const batchFile = message.Body ? JSON.parse(message.Body) : {};
    this.createContactUseCase.execute(batchFile as CreateContactInputCommand);
  }
}
