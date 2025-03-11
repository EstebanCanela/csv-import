import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class ProcessFileRequestDto {
  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsString()
  file_type: string;

  @IsNotEmpty()
  @IsNumber()
  file_size: number;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}

export class ConfigurationDto {
  field: string;
  required: boolean;
}

export class ProcessFileResponseDto {
  id: string;
  status: string;
  user_id: string;
  headers: string[];
  first_row: Record<string, unknown>;
  configuration: ConfigurationDto[];
}
