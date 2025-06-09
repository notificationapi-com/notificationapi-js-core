class Logger {
  constructor(private debug: boolean = false) {}

  log(...args: any[]) {
    if (this.debug) {
      console.log('[NotificationAPI js core SDK Debug]', ...args);
    }
  }

  warn(...args: any[]) {
    if (this.debug) {
      console.warn('[NotificationAPI js core SDK Debug]', ...args);
    }
  }

  error(...args: any[]) {
    if (this.debug) {
      console.error('[NotificationAPI js core SDK Debug]', ...args);
    }
  }
}

export { Logger };
