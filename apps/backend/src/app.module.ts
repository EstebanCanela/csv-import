import { Module, OnModuleInit } from '@nestjs/common';
import config from 'config/config';
import { ConfigModule } from '@nestjs/config';
import { ContactsModule } from './contacts/contacts.module';
import { CommonModule } from './common/common.module';
import { SqsModule } from '@ssut/nestjs-sqs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    SqsModule.registerAsync({
      useFactory: () => {
        return {
          consumers: [
            {
              region: config().queue.region || 'us-east-1',
              name: config().queue.createContactQueueName || '',
              queueUrl: config().queue.createContactFilesQueueUrl || '',
              endpoint: 'http://localhost:4566',
              waitTimeSeconds: 20,
              visibilityTimeout: 30,
              pollingWaitTimeMs: 0,
            },
          ],
          producers: [],
        };
      },
    }),
    ContactsModule,
    CommonModule,
  ],
  controllers: [],
})
export class AppModule {}
