export interface PageResponseDto {
  cursor: string | null;
  total_of_rows: number;
  size: number;
}

export interface ContactResponseDto {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  status: string;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetContactsResponseDto {
  status: string;
  data: ContactResponseDto[];
  page: PageResponseDto;
}
