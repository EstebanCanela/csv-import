import { FileModel, FileStatus } from '../../../domain/models/file.model';

export default interface FilesPort {
  createFile(input: FileModel): Promise<void>;
  getById(id: string, status?: FileStatus): Promise<FileModel | null>;
  updateFile(id: number, file: Partial<FileModel>): Promise<void>;
  getByUserId(userId: string): Promise<FileModel | null>;
}
