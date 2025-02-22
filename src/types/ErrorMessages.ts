export const errorMessages = {
  load: 'Unable to load todos',
  empty: 'Title should not be empty',
  add: 'Unable to add a todo',
  delete: 'Unable to delete a todo',
  update: 'Unable to update a todo',
};

export type ErrorType = keyof typeof errorMessages;
