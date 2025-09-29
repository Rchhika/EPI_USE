export const toSelectValue = (value: unknown) =>
  value === undefined || value === null || value === '' ? undefined : String(value);


