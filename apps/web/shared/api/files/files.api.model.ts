export interface PresignedUrlModel {
  url: string;
  expiresIn: number;
}

export interface ProcessFileResponseDto {
  id: string;
  status: string;
  user_id: string;
  headers: string[];
  first_row: Record<string, unknown>;
  configuration: ConfigurationDto[];
}

export interface ConfigurationDto {
  field: string;
  required: boolean;
}

export interface ConfigurationExportFileDto {
  field: string;
  value: string;
}

export interface ExportFileRequestDto {
  configuration: ConfigurationExportFileDto[];
}

export interface ExportFileResponseDto {
  id: string;
  status: string;
}
