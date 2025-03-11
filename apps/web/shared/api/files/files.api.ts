import {
  ExportFileRequestDto,
  ExportFileResponseDto,
  PresignedUrlModel,
  ProcessFileResponseDto,
} from "./files.api.model";

export const getPresignedUrl = async (filename: string, userId: string) => {
  const presignedUrlResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/contacts/files/presigned-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: filename,
        user_id: userId,
      }),
    }
  );

  if (!presignedUrlResponse.ok) {
    throw new Error("Failed to get presigned URL");
  }

  const data: PresignedUrlModel = await presignedUrlResponse.json();
  return data;
};

export const createFile = async (
  filename: string,
  fileType: string,
  fileSize: number,
  userId: string
) => {
  const notifyResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/contacts/files`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: filename,
        file_size: fileSize,
        user_id: userId,
        file_type: fileType,
      }),
    }
  );

  if (!notifyResponse.ok) {
    throw new Error("Failed to notify backend of successful upload");
  }

  const data: ProcessFileResponseDto = await notifyResponse.json();

  return data;
};

export const exportFile = async (id: string, body: ExportFileRequestDto) => {
  const exportResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/contacts/files/${id}/export`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
      }),
    }
  );

  if (!exportResponse.ok) {
    throw new Error("Failed to export file");
  }

  const data: ExportFileResponseDto = await exportResponse.json();
  return data;
};
