import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
} from '../dtos/presigned-url.dto';
import PresignedUrlUseCase from '../../../application/usecases/presigned-url.usecase';
import ProcessFileUseCase from '../../../application/usecases/process-file.usecase';
import {
  ProcessFileRequestDto,
  ProcessFileResponseDto,
} from '../dtos/process-file.dto';
import {
  ExportFileRequestDto,
  ExportFileResponseDto,
} from '../dtos/export-file.dto';
import ExportFileUseCase from '../../../application/usecases/export-file.usecase';
import GetContactsUseCase from '../../../application/usecases/get-contacts.usecase';
import { GetContactsOutputDto } from '../dtos/contacts.dto';

@Controller('v1/contacts')
export class ContactsController {
  constructor(
    private readonly presignedUrlUseCase: PresignedUrlUseCase,
    private readonly processFileUseCase: ProcessFileUseCase,
    private readonly exportFileUseCase: ExportFileUseCase,
    private readonly getContactsUseCase: GetContactsUseCase,
  ) {}

  @Post('/files/presigned-url')
  async presignedUrl(
    @Body() body: PresignedUrlRequestDto,
  ): Promise<PresignedUrlResponseDto> {
    const response = await this.presignedUrlUseCase.execute({
      filename: body.filename,
      userId: body.user_id,
    });
    return {
      url: response.url,
      expires_in: response.expiresIn,
    };
  }

  @Post('/files')
  async files(
    @Body() body: ProcessFileRequestDto,
  ): Promise<ProcessFileResponseDto> {
    const response = await this.processFileUseCase.execute({
      filename: body.filename,
      fileType: body.file_type,
      fileSize: body.file_size,
      userId: body.user_id,
    });
    return {
      id: response.id,
      user_id: response.userId,
      status: response.status,
      headers: response.headers,
      first_row: response.firstRow,
      configuration: response.configuration.map((value) => ({
        field: value.field,
        required: value.required,
      })),
    };
  }

  @Patch('/files/:id/export')
  async fileExport(
    @Param('id') id: string,
    @Body() body: ExportFileRequestDto,
  ): Promise<ExportFileResponseDto> {
    const response = await this.exportFileUseCase.execute({
      fileId: id,
      configuration: body.configuration,
    });
    return {
      id: response.id,
      status: response.status,
    };
  }

  @Get('/')
  async getContacts(
    @Query('user_id') userId: string,
    @Query('page_size') pageSize: number,
    @Query('cursor') cursor: string,
  ): Promise<GetContactsOutputDto> {
    const response = await this.getContactsUseCase.execute({
      userId,
      pageSize,
      cursor,
    });
    return {
      status: response.status,
      data: response.data.map((value) => ({
        id: value.id,
        first_name: value.firstName,
        last_name: value.lastName,
        email: value.email,
        status: value.status,
        error: value.error,
        created_at: value.createdAt,
        updated_at: value.updatedAt,
      })),
      page: {
        cursor: response.page.cursor,
        total_of_rows: response.page.totalOfRows,
        size: response.page.size,
      },
    };
  }
}
