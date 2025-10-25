/**
 * Development-only logging utility
 * Logs are only shown in development mode (localhost)
 */

const isDev = process.env.NODE_ENV !== 'production';

export const devLog = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};

export const devError = (...args: any[]) => {
  if (isDev) {
    console.error(...args);
  }
};

export const devWarn = (...args: any[]) => {
  if (isDev) {
    console.warn(...args);
  }
};
