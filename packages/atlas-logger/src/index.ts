export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARNING = 3,
  ERROR = 4,
  FATAL = 5,
}

export interface LoggerOptions {
  level?: LogLevel;
  context?: string;
}

export class AtlasLogger {
  private level: LogLevel;
  private context: string;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.context = options.context ?? 'System';
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: LogLevel, message: string, details?: any): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    const contextStr = this.context ? `[${this.context}]` : '';
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    return `[${timestamp}] [${levelStr}] ${contextStr} ${message}${detailsStr}`;
  }

  public log(level: LogLevel, message: string, details?: any) {
    if (this.shouldLog(level)) {
      const formatted = this.formatMessage(level, message, details);
      if (level >= LogLevel.ERROR) {
        console.error(formatted);
      } else if (level === LogLevel.WARNING) {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }
    }
  }

  public trace(message: string, details?: any) {
    this.log(LogLevel.TRACE, message, details);
  }

  public debug(message: string, details?: any) {
    this.log(LogLevel.DEBUG, message, details);
  }

  public info(message: string, details?: any) {
    this.log(LogLevel.INFO, message, details);
  }

  public warn(message: string, details?: any) {
    this.log(LogLevel.WARNING, message, details);
  }

  public error(message: string, details?: any) {
    this.log(LogLevel.ERROR, message, details);
  }

  public fatal(message: string, details?: any) {
    this.log(LogLevel.FATAL, message, details);
  }
}
