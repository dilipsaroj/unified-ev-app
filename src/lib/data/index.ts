import { mockClient } from './mockClient';
import { apiClient } from './apiClient';
import type { DataClient } from './types';

const mode = process.env.NEXT_PUBLIC_DATA_MODE ?? 'mock';

export const dataClient: DataClient = mode === 'api' ? apiClient : mockClient;

export type { DataClient };
export * from './types';
