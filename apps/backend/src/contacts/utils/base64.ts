function encodeBase64(jsonObj: object): string {
  const jsonString = JSON.stringify(jsonObj);
  return Buffer.from(jsonString).toString('base64');
}

function decodeBase64(base64String: string): object {
  const jsonString = Buffer.from(base64String, 'base64').toString('utf-8'); // Decode Base64
  return JSON.parse(jsonString);
}

export { encodeBase64, decodeBase64 };
