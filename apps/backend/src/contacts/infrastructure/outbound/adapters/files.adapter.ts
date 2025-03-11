import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../../../../constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../common/database/schema';
import { and, eq } from 'drizzle-orm';

import FilesPort from '../../../application/ports/files/files.port';
import {
  ConfigurationModel,
  FileModel,
  FileStatus,
} from '../../../domain/models/file.model';
import {
  filesInsertSchema,
  filesUpdateSchema,
} from '../../../../common/database/schema';

@Injectable()
export default class FilesAdapter implements FilesPort {
  constructor(
    @Inject(PG_CONNECTION) private conn: NodePgDatabase<typeof schema>,
  ) {}

  async updateFile(id: number, file: Partial<FileModel>): Promise<void> {
    const value = filesUpdateSchema.parse(file);

    await this.conn
      .update(schema.files)
      .set(value)
      .where(eq(schema.files.id, id));

    return;
  }

  async createFile(input: FileModel): Promise<void> {
    const value = filesInsertSchema.parse({
      status: input.status,
      filename: input.filename,
      fileSize: input.fileSize ? input.fileSize.toString() : '',
      publicId: input.publicId,
      userId: input.userId,
      fileType: input.fileType,
    });

    await this.conn.insert(schema.files).values(value);

    return;
  }

  async getById(id: string, status?: FileStatus): Promise<FileModel | null> {
    const conditions = [eq(schema.files.publicId, id)];

    if (status) {
      conditions.push(eq(schema.files.status, status));
    }

    const file = await this.conn.query.files.findFirst({
      where: and(...conditions),
    });

    if (!file) {
      return null;
    }

    return this.mapFile(file);
  }

  async getByUserId(userId: string): Promise<FileModel | null> {
    const conditions = [eq(schema.files.userId, userId)];

    const file = await this.conn.query.files.findFirst({
      where: and(...conditions),
    });

    if (!file) {
      return null;
    }

    return this.mapFile(file);
  }

  private mapFile(file: schema.Files): FileModel {
    let configurationsMapped = [] as ConfigurationModel[];
    if (file.configuration) {
      const config = file.configuration as ConfigurationModel[];
      configurationsMapped = config.map((conf) => ({
        field: conf.field,
        internal: conf.internal,
        value: conf.value,
      }));
    }

    return {
      id: file.id,
      filename: file.filename,
      numberOfRows: Number(file.numberOfRows),
      fileType: file.fileType || undefined,
      fileSize: Number(file.fileSize),
      status: FileStatus[file.status],
      publicId: file.publicId,
      userId: file.userId,
      configuration: configurationsMapped,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }
}
