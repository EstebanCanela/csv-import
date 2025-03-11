export enum FileStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  IN_PROGRESS = 'IN_PROGRESS',
  ERROR = 'ERROR',
}

export class ConfigurationModel {
  field: string;
  internal: string;
  value: string;
}

export class FileModel {
  id?: number;
  filename?: string;
  numberOfRows?: number;
  fileType?: string;
  fileSize?: number;
  status: FileStatus;
  publicId: string;
  userId?: string;
  configuration?: ConfigurationModel[];
  createdAt?: Date;
  updatedAt?: Date;
}
