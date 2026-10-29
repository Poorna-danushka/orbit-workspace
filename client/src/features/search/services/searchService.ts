import api from '@/lib/api/client';
import type { WorkspaceSearchResult } from '../types';

export const searchWorkspace = (query: string) =>
  api.get<WorkspaceSearchResult>(`/search?q=${encodeURIComponent(query)}`);
