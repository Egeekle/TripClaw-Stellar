/**
 * TripClaw Logger Service
 * Centralized logging for production monitoring.
 * Can be extended to send logs to Sentry, LogRocket, or a custom backend.
 */

const IS_PROD = import.meta.env.PROD;

class Logger {
  info(message, ...args) {
    if (!IS_PROD) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    console.warn(`[WARN] ${message}`, ...args);
    // TODO: Send to remote monitoring if critical
  }

  error(message, error = null, ...args) {
    console.error(`[ERROR] ${message}`, error, ...args);
    
    if (IS_PROD) {
      // Logic for remote error tracking (e.g. Sentry.captureException(error))
    }
  }

  debug(message, ...args) {
    if (!IS_PROD) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
