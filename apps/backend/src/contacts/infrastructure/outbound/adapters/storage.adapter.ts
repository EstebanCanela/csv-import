import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import StoragePort from '../../../application/ports/storage/storage.port';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { getReadableStream } from '../../../utils/csv-stream.util';

@Injectable()
export default class StorageAdapter implements StoragePort {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('storage.region') || 'us-east-1',
      credentials: {
        accessKeyId:
          this.configService.get<string>('storage.accessKeyId') || '',
        secretAccessKey:
          this.configService.get<string>('storage.secretAccessKey') || '',
      },
    });
    this.bucketName =
      this.configService.get<string>('storage.bucketName') || '';
  }

  async getPresignedUrl(key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: 'text/csv',
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return presignedUrl;
  }

  async getStreamFile(filepath: string): Promise<any> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: filepath,
      });

      const { Body } = await this.s3Client.send(command);

      const fileStream = await getReadableStream(Body);

      return fileStream;
    } catch (err) {
      throw new Error('Error fetching from S3');
    }
  }
}
