import { Readable } from 'stream';

export default interface StoragePort {
  getPresignedUrl(key: string): Promise<string>;

  getStreamFile(filepath: string): Promise<Readable>;
}
