import { Module, OnModuleInit } from '@nestjs/common';
import config from 'config/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          consumers: [
            {
              region: configService.get<string>('queue.region', 'us-east-1'),
              name: configService.get<string>(
                'queue.createContactQueueName',
                '',
              ),
              queueUrl: configService.get<string>(
                'queue.createContactFilesQueueUrl',
                '',
              ),
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
