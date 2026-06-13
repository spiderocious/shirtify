import { parseApiError, type ApiError } from '@shirtify/api';
import { HTTPError } from 'ky';

/** Normalise an unknown thrown value into our ApiError envelope shape. */
export const toApiError = async (err: unknown): Promise<ApiError> => {
  if (err instanceof HTTPError) {
    try {
      const body = await err.response.clone().json();
      return parseApiError(body);
    } catch {
      return { code: 'unknown', message: 'Something went wrong' };
    }
  }
  if (err instanceof Error) return { code: 'unknown', message: err.message };
  return { code: 'unknown', message: 'Something went wrong' };
};
