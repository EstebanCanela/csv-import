import { Readable } from 'stream';
import * as csv from 'fast-csv';

class HeadersEntity {
  headers: string[];
  row: Record<string, unknown>;
}

export async function getHeadersAndFirstRow(readableStream: Readable) {
  const getHeaders = new Promise<HeadersEntity>((resolve, reject) => {
    let headers: string[] = [];
    let firstRow: object | null = null;
    let firstRowRead = false;
    const parserStream = readableStream
      .pipe(
        csv.parse({
          headers: true,
          skipLines: 4,
          delimiter: ',',
        }),
      )
      .on('headers', (cols) => {
        headers = cols;
      })
      .on('data', (row) => {
        if (!firstRowRead) {
          firstRow = row;
          firstRowRead = true;
          parserStream.destroy();
          resolve({
            headers,
            row,
          });
        }
      })
      .on('error', (err) => {
        reject('Error processing CSV');
      });
  });

  return getHeaders;
}

export async function getReadableStream(
  inputStream: unknown,
): Promise<Readable> {
  if (inputStream instanceof Readable) {
    return inputStream;
  }

  if (inputStream instanceof Blob) {
    const buffer = Buffer.from(await inputStream.arrayBuffer());
    return Readable.from(buffer);
  }

  throw new Error(`Unsupported inputStream type: ${typeof inputStream}`);
}
