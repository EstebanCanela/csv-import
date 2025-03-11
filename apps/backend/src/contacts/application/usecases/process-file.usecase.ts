import { Injectable } from '@nestjs/common';
import StorageAdapter from '../../infrastructure/outbound/adapters/storage.adapter';
import { v4 as uuidv4 } from 'uuid';

import {
  ProcessFileInputCommand,
  ProcessFileOutputCommand,
} from '../commands/process-file.command';
import { FileModel, FileStatus } from '../../domain/models/file.model';
import FilesAdapter from '../../infrastructure/outbound/adapters/files.adapter';
import { CONFIGURATION_FIELDS } from '../../../constants';
import { getHeadersAndFirstRow } from '../../utils/csv-stream.util';

@Injectable()
export default class ProcessFileUseCase {
  constructor(
    private readonly storageAdapter: StorageAdapter,
    private readonly filesAdapter: FilesAdapter,
  ) {}

  async execute(
    input: ProcessFileInputCommand,
  ): Promise<ProcessFileOutputCommand> {
    const streamedFile = await this.storageAdapter.getStreamFile(
      `${input.userId}/${input.filename}`,
    );

    const { headers, row } = await getHeadersAndFirstRow(streamedFile);

    const file: FileModel = {
      filename: input.filename,
      fileType: input.fileType,
      fileSize: input.fileSize,
      status: FileStatus.PENDING,
      publicId: uuidv4(),
      userId: input.userId,
    };

    await this.filesAdapter.createFile(file);

    return {
      id: file.publicId,
      status: file.status,
      userId: input.userId,
      headers: headers,
      firstRow: row,
      configuration: CONFIGURATION_FIELDS,
    };
  }
}
