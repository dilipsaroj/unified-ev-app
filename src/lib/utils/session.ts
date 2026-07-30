export const genSessionId = (): string =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

export const getShortSessionId = (sessionId: string): string =>
  `#${sessionId.slice(0, 4)}`;
