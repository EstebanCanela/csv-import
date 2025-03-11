export class ConfigurationMappingCommand {
  field: string;
  value: string;
}

export class ExportFileInputCommand {
  fileId: string;
  configuration: ConfigurationMappingCommand[];
}

export class ExportFileOutputCommand {
  id: string;
  status: string;
}
