export class NetworkError extends Error {
  constructor(message = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isNetworkError(err: unknown): boolean {
  return err instanceof NetworkError || (err instanceof TypeError && /network|fetch/i.test(err.message));
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

export function isRetryableError(err: unknown): boolean {
  if (isNetworkError(err)) return true;
  if (err instanceof ApiError) return err.status >= 500 || err.status === 429;
  return false;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
