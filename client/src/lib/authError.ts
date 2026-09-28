import { AxiosError } from 'axios';

interface AuthErrorPayload {
  message?: string;
  errors?: { msg?: string }[];
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as AuthErrorPayload | undefined;
    const validationMessages = payload?.errors
      ?.map((item) => item.msg)
      .filter((message): message is string => Boolean(message));

    if (validationMessages?.length) return validationMessages.join(' ');
    return payload?.message || error.message || fallback;
  }

  return error instanceof Error && error.message ? error.message : fallback;
}
