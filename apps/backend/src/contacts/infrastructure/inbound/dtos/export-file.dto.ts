import { IsNotEmpty, IsString } from 'class-validator';

export class ConfigurationDTO {
  @IsNotEmpty()
  @IsString()
  field: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}

export class ExportFileRequestDto {
  @IsNotEmpty()
  configuration: ConfigurationDTO[];
}

export class ExportFileResponseDto {
  id: string;
  status: string;
}
