const SUPABASE_AVAILABILITY_STATUS = new Set([502, 503, 504, 521, 522, 523, 524]);

const SUPABASE_AVAILABILITY_PATTERNS = [
  /\b521\b/i,
  /\b522\b/i,
  /\b523\b/i,
  /\b524\b/i,
  /\b502\b/i,
  /\b503\b/i,
  /\b504\b/i,
  /auth\/v1\/health/i,
  /rest-admin\/v1\/ready/i,
  /fetch failed/i,
  /network error/i,
  /connection refused/i,
  /socket hang up/i,
  /temporary unavailable/i,
  /timed out/i,
  /upstream/i,
  /gateway/i,
  /supabase unavailable/i,
  /failed to reach supabase/i,
];

const DEFAULT_SERVICE_UNAVAILABLE_MESSAGE = 'CRM backend is temporarily unavailable. Please retry shortly.';

function getErrorStatus(error: unknown): number {
  if (!error || typeof error !== 'object') {
    return 0;
  }

  const candidate = error as {status?: unknown; statusCode?: unknown; code?: unknown};

  const numericStatus = Number(candidate.status);
  if (Number.isFinite(numericStatus) && numericStatus > 0) {
    return numericStatus;
  }

  const numericStatusCode = Number(candidate.statusCode);
  if (Number.isFinite(numericStatusCode) && numericStatusCode > 0) {
    return numericStatusCode;
  }

  const numericCode = Number(candidate.code);
  if (Number.isFinite(numericCode) && numericCode > 0) {
    return numericCode;
  }

  return 0;
}

function collectErrorText(error: unknown): string {
  if (!error) {
    return '';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    const causeText = collectErrorText((error as Error & {cause?: unknown}).cause);
    return [error.name, error.message, causeText].filter(Boolean).join(' ');
  }

  if (typeof error === 'object') {
    const candidate = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      error_description?: unknown;
      cause?: unknown;
      code?: unknown;
    };

    return [
      typeof candidate.message === 'string' ? candidate.message : '',
      typeof candidate.details === 'string' ? candidate.details : '',
      typeof candidate.hint === 'string' ? candidate.hint : '',
      typeof candidate.error_description === 'string' ? candidate.error_description : '',
      typeof candidate.code === 'string' ? candidate.code : '',
      collectErrorText(candidate.cause),
    ].filter(Boolean).join(' ');
  }

  return '';
}

export function isSupabaseAvailabilityError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (SUPABASE_AVAILABILITY_STATUS.has(status)) {
    return true;
  }

  const text = collectErrorText(error);
  if (!text) {
    return false;
  }

  return SUPABASE_AVAILABILITY_PATTERNS.some((pattern) => pattern.test(text));
}

export function mapCrmApiError(
  error: unknown,
  fallbackMessage: string,
  serviceUnavailableMessage = DEFAULT_SERVICE_UNAVAILABLE_MESSAGE,
) {
  if (isSupabaseAvailabilityError(error)) {
    return {
      status: 503,
      message: serviceUnavailableMessage,
    };
  }

  const message =
    typeof (error as {message?: unknown})?.message === 'string'
      ? String((error as {message?: unknown}).message)
      : fallbackMessage;

  return {
    status: 500,
    message,
  };
}
