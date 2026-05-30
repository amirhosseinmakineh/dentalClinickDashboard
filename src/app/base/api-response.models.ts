export interface BaseResponse<T> {
  data?: T;
  Data?: T;
  result?: T;
  Result?: T;
  value?: T;
  Value?: T;
  isSuccess?: boolean;
  IsSuccess?: boolean;
  message?: string;
  Message?: string;
  messages?: string[];
  Messages?: string[];
  errors?: string[] | Record<string, string[]>;
  Errors?: string[] | Record<string, string[]>;
  statusCode?: number;
  StatusCode?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface BackendErrorEnvelope {
  error?: unknown;
}

export function getResponseData<T>(response: BaseResponse<T> | T): T {
  if (response && typeof response === 'object') {
    const wrappedResponse = response as BaseResponse<T>;

    if ('data' in wrappedResponse) {
      return wrappedResponse.data as T;
    }

    if ('Data' in wrappedResponse) {
      return wrappedResponse.Data as T;
    }

    if ('result' in wrappedResponse) {
      return wrappedResponse.result as T;
    }

    if ('Result' in wrappedResponse) {
      return wrappedResponse.Result as T;
    }

    if ('value' in wrappedResponse) {
      return wrappedResponse.value as T;
    }

    if ('Value' in wrappedResponse) {
      return wrappedResponse.Value as T;
    }
  }

  return response as T;
}

export function getResponseMessage<T>(response: BaseResponse<T> | T, fallback: string): string {
  if (response && typeof response === 'object') {
    const wrappedResponse = response as BaseResponse<T>;

    if (wrappedResponse.message ?? wrappedResponse.Message) {
      return (wrappedResponse.message ?? wrappedResponse.Message) as string;
    }

    const messages = wrappedResponse.messages ?? wrappedResponse.Messages;

    if (messages?.length) {
      return messages.join('\n');
    }
  }

  return fallback;
}

export function isSuccessfulResponse<T>(response: BaseResponse<T> | T): boolean {
  if (response && typeof response === 'object') {
    const wrappedResponse = response as BaseResponse<T>;
    const success = wrappedResponse.isSuccess ?? wrappedResponse.IsSuccess;

    if (success !== undefined) {
      return success;
    }
  }

  return true;
}

export function getBackendErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const backendError = (error as BackendErrorEnvelope).error;

  if (typeof backendError === 'string' && backendError.trim()) {
    return backendError;
  }

  if (backendError && typeof backendError === 'object') {
    const response = backendError as BaseResponse<unknown>;

    if (response.message ?? response.Message) {
      return (response.message ?? response.Message) as string;
    }

    const messages = response.messages ?? response.Messages;

    if (messages?.length) {
      return messages.join('\n');
    }

    const errors = response.errors ?? response.Errors;

    if (Array.isArray(errors)) {
      return errors.join('\n');
    }

    if (errors && typeof errors === 'object') {
      return Object.values(errors).flat().join('\n');
    }
  }

  return fallback;
}
