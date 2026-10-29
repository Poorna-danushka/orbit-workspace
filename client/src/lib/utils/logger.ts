type LogDetails = {
  code?: string;
  requestId?: string;
  status?: number;
};

function log(level: 'error' | 'warn', event: string, details?: LogDetails): void {
  const safeDetails = details
    ? Object.fromEntries(
        Object.entries(details).filter((entry) => entry[1] !== undefined),
      )
    : undefined;
  console[level](`[orbit] ${event}`, safeDetails ?? '');
}

export const logger = {
  error: (event: string, details?: LogDetails) => log('error', event, details),
  warn: (event: string, details?: LogDetails) => log('warn', event, details),
};
