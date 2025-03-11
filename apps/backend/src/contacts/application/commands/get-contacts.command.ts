export class GetContactsInputCommand {
  userId: string;
  pageSize?: number;
  cursor?: string;
}

export class ContactOutputCommand {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  status: string;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export class PageOutputCommand {
  cursor: string | null;
  totalOfRows: number;
  size: number;
}

export class GetContactsOutputCommand {
  status: string;
  data: ContactOutputCommand[];
  page: PageOutputCommand;
}
