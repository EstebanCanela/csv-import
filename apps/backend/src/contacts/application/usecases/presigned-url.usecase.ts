import { Injectable } from '@nestjs/common';
import StorageAdapter from '../../infrastructure/outbound/adapters/storage.adapter';
import {
  PresignedUrlCommandInput,
  PresignedUrlCommandOutput,
} from '../commands/presigned-url.command';

@Injectable()
export default class PresignedUrlUseCase {
  constructor(private readonly storageAdapter: StorageAdapter) {}

  async execute(
    input: PresignedUrlCommandInput,
  ): Promise<PresignedUrlCommandOutput> {
    const url = await this.storageAdapter.getPresignedUrl(
      `${input.userId}/${input.filename}`,
    );
    return {
      url,
      expiresIn: 3600,
    };
  }
}
