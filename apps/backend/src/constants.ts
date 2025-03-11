export const PG_CONNECTION = 'PG_CONNECTION';

export const CONFIGURATION_FIELDS = [
  {
    field: 'first_name',
    internal: 'firstName',
    required: true,
  },
  {
    field: 'email',
    internal: 'email',
    required: true,
  },
  {
    field: 'last_name',
    internal: 'lastName',
    required: false,
  },
];

export const BATCH_QUEUE_SIZE = 3000;
