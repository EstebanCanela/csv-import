import { IsNotEmpty, IsUUID, MaxLength, MinLength } from 'class-validator';

export class PresignedUrlRequestDto {
  @IsNotEmpty()
  @MaxLength(64)
  filename: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}

export class PresignedUrlResponseDto {
  url: string;
  expires_in: number;
}
