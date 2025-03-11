export class CreateContactFile {
  id: number;
  userId: string;
  configuration: Record<string, unknown>[];
  filename: string;
}

export class CreateContactInputCommand {
  file: CreateContactFile;
  batch: Record<string, unknown>[];
}
