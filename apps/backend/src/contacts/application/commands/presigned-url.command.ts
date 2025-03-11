export class PresignedUrlCommandOutput {
  url: string;
  expiresIn: number;
}

export class PresignedUrlCommandInput {
  filename: string;
  userId: string;
}
