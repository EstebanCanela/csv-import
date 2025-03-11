import { z } from 'zod';

export enum ContactStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export class ContactModel {
  id?: number;
  publicId: string;
  firstName: string;
  lastName?: string;
  email: string;
  fileId: number;
  status: ContactStatus;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const ContactSchemaValidator = z.object({
  publicId: z.string(),
  firstName: z.string(),
  email: z.string(),
});
