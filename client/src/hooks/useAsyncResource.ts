'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

interface AsyncResourceOptions<T> {
  enabled?: boolean;
  initialData?: T;
}

interface AsyncResource<T> {
  data: T | undefined;
  loading: boolean;
  error: unknown;
  reload: () => Promise<T | undefined>;
  setData: Dispatch<SetStateAction<T | undefined>>;
}

export function useAsyncResource<T>(
  load: (signal: AbortSignal) => Promise<T>,
  options: AsyncResourceOptions<T> = {},
): AsyncResource<T> {
  const { enabled = true, initialData } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<unknown>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    await Promise.resolve();
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const result = await load(controller.signal);
      if (controller.signal.aborted) return undefined;
      setData(result);
      return result;
    } catch (loadError: unknown) {
      if (!controller.signal.aborted) setError(loadError);
      return undefined;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }, [load]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active && enabled) void reload();
    });
    return () => {
      active = false;
      controllerRef.current?.abort();
    };
  }, [enabled, reload]);

  return { data, loading, error, reload, setData };
}
