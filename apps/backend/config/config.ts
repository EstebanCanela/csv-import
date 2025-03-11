export default () => ({
  port: process.env.PORT || 3004,
  db: {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    host: process.env.POSTGRES_HOST,
  },
  queue: {
    endpoint: process.env.QUEUE_ENDPOINT || '',
    region: process.env.SQS_REGION || 'us-east-1',
    createContactQueueName: 'sqs-create-contact-queue',
    createContactFilesQueueUrl:
      process.env.SQS_CREATE_CONTACT_QUEUE_URL ||
      'http://localhost:4566/000000000000/sqs-create-contact-queue',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  storage: {
    region: process.env.SQS_REGION || 'us-east-1',
    apiVersion: '2012-11-05',
    bucketName: process.env.BUCKET_NAME,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
