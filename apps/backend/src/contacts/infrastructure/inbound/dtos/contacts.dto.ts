export class PageOutputDto {
  cursor: string | null;
  total_of_rows: number;
  size: number;
}

export class ContactOutputDto {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  status: string;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export class GetContactsOutputDto {
  status: string;
  data: ContactOutputDto[];
  page: PageOutputDto;
}
