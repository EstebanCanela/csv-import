export class ProcessFileInputCommand {
  filename: string;
  fileType: string;
  fileSize: number;
  userId: string;
}

export class ConfigurationCommand {
  field: string;
  required: boolean;
}

export class ProcessFileOutputCommand {
  id: string;
  status: string;
  userId: string;
  configuration: ConfigurationCommand[];
  headers: string[];
  firstRow: Record<string, unknown>;
}
