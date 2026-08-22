import {
  ApiError,
  isFloorNumberDuplicateApiError,
  isTechnicalApiMessage,
} from '@/shared/api/errors';

export type CreateEntitySubmitErrorKind = 'floor';

type ResolveCreateEntityErrorOptions = {
  kind?: CreateEntitySubmitErrorKind | undefined;
  submittedValue?: string | undefined;
  floorNumberExists: (values: { number: string }) => string;
  generic: string;
};

/**
 * Maps API failures from inline create forms to user-facing toast copy.
 */
export const resolveCreateEntityError = (
  error: unknown,
  options: ResolveCreateEntityErrorOptions,
): string => {
  if (options.kind === 'floor' && isFloorNumberDuplicateApiError(error)) {
    return options.floorNumberExists({
      number: options.submittedValue ?? '',
    });
  }

  if (
    error instanceof ApiError &&
    error.message.length > 0 &&
    !isTechnicalApiMessage(error.message)
  ) {
    return error.message;
  }

  return options.generic;
};
