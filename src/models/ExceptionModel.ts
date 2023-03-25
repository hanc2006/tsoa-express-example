type MsException = 'ERR_INVALID_EMAIL' | 'ERR_INVALID_NAME';

interface ErrorDetail<T> {
    code: T;
    message?: string;
}

export type HttpResponseError = ErrorDetail<MsException>;