import { Injectable } from '@nestjs/common';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import QueuePort from 'src/contacts/application/ports/queue/queue.port';

@Injectable()
export default class QueueAdapter implements QueuePort {
  private readonly sqsClient: SQSClient;
  private readonly queueName: string;

  constructor(private configService: ConfigService) {
    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('queue.region') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('queue.accessKeyId') || '',
        secretAccessKey:
          this.configService.get<string>('queue.secretAccessKey') || '',
      },
      ...(configService.get<string>('queue.endpoint', '')
        ? { endpoint: configService.get<string>('queue.endpoint', '') }
        : {}),
    });

    this.queueName =
      this.configService.get<string>('queue.createContactQueueName') || '';
  }

  async publishMessage(message: Record<string, unknown>): Promise<void> {
    const params = {
      QueueUrl: this.queueName,
      MessageBody: JSON.stringify(message),
    };

    try {
      const command = new SendMessageCommand(params);
      await this.sqsClient.send(command);
      return;
    } catch (error) {
      console.error(`Error sending message to SQS`, error);
      throw error;
    }
  }
}
