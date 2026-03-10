import { Matches, ValidationOptions } from 'class-validator';

export const CUID_PATTERN = /^c[a-z0-9]{24}$/;
export const INVALID_RESOURCE_IDENTIFIER_MESSAGE =
  'Invalid resource identifier';

export function IsCuidString(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return Matches(CUID_PATTERN, {
    message: INVALID_RESOURCE_IDENTIFIER_MESSAGE,
    ...validationOptions,
  });
}
