import { HttpException, Injectable } from '@nestjs/common';
import StorageAdapter from '../../infrastructure/outbound/adapters/storage.adapter';

import FilesAdapter from '../../infrastructure/outbound/adapters/files.adapter';
import {
  ConfigurationMappingCommand,
  ExportFileInputCommand,
  ExportFileOutputCommand,
} from '../commands/export-file.command';
import * as csv from 'fast-csv';
import { Readable } from 'stream';
import QueueAdapter from '../../infrastructure/outbound/adapters/queue.adapter';
import { CONFIGURATION_FIELDS, BATCH_QUEUE_SIZE } from '../../../constants';
import {
  ConfigurationModel,
  FileModel,
  FileStatus,
} from '../../domain/models/file.model';

@Injectable()
export default class ExportFileUseCase {
  constructor(
    private readonly storageAdapter: StorageAdapter,
    private readonly filesAdapter: FilesAdapter,
    private readonly queueAdapter: QueueAdapter,
  ) {}

  async execute(
    input: ExportFileInputCommand,
  ): Promise<ExportFileOutputCommand> {
    const validateConfig = this.validateConfiguration(input.configuration);
    if (validateConfig.length) {
      throw new HttpException(
        `Missing required field: [${validateConfig}]`,
        400,
      );
    }

    const file = await this.filesAdapter.getById(
      input.fileId,
      FileStatus.PENDING,
    );

    if (!file || !file.id) {
      throw new HttpException('File not found', 404);
    }

    const configurationMapped: ConfigurationModel[] = input.configuration.map(
      (conf) => {
        const property = CONFIGURATION_FIELDS.find(
          (value) => value.field === conf.field,
        );
        return {
          field: conf.field,
          internal: property?.internal || conf.value,
          value: conf.value,
        };
      },
    );

    await this.filesAdapter.updateFile(file?.id, {
      status: FileStatus.IN_PROGRESS,
      configuration: configurationMapped,
    });

    const streamedFile = await this.storageAdapter.getStreamFile(
      `${file?.userId}/${file?.filename}`,
    );

    this.sendRowToQueue(file, configurationMapped, streamedFile);

    return {
      id: file.publicId,
      status: FileStatus.IN_PROGRESS,
    };
  }

  private validateConfiguration(config: ConfigurationMappingCommand[]) {
    const providedFields = new Set(config.map((c) => c.field));
    const errors = [] as string[];

    for (const configField of CONFIGURATION_FIELDS) {
      if (configField.required && !providedFields.has(configField.field)) {
        errors.push(`${configField.field}`);
      }
    }

    return errors;
  }

  private async sendRowToQueue(
    file: FileModel,
    configuration: ConfigurationModel[],
    readableStream: Readable,
  ) {
    const getHeaders = new Promise<void>((resolve, reject) => {
      let numberOfRows = 0;
      let batch = [] as any;
      const sendToHighPriority = false;

      const fileConfiguration = {
        id: file.id,
        filename: file.filename,
        userId: file.userId,
        configuration,
      };

      const csvStream = csv.parse({
        headers: true,
        skipLines: 4,
        delimiter: ',',
      });

      readableStream
        .pipe(csvStream)
        .on('data', (row) => {
          batch.push(row);
          numberOfRows++;

          if (batch.length === BATCH_QUEUE_SIZE) {
            this.queueAdapter.publishMessage({
              file: fileConfiguration,
              batch,
            });
            batch = [];
          }
        })
        .on('end', () => {
          this.filesAdapter.updateFile(file.id || 0, {
            numberOfRows: numberOfRows - 2,
            status: FileStatus.SUCCESS,
          });

          batch = batch.slice(0, -2);

          if (
            !sendToHighPriority &&
            batch.length &&
            batch.length <= BATCH_QUEUE_SIZE
          ) {
            this.queueAdapter.publishMessage({
              file: fileConfiguration,
              batch,
            });
          }

          resolve();
        })
        .on('error', (err) => {
          this.filesAdapter.updateFile(file.id || 0, {
            status: FileStatus.ERROR,
          });
        });
    });

    return getHeaders;
  }
}
