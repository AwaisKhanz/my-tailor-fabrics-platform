import type { LoggerService } from '@nestjs/common';

type SecurityLogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

type SecurityEventData = Record<string, unknown>;

export function emitSecurityEvent(
  logger: Pick<LoggerService, SecurityLogLevel>,
  event: string,
  data: SecurityEventData = {},
  level: SecurityLogLevel = 'warn',
): void {
  const message = `[SECURITY_EVENT] ${JSON.stringify({
    event,
    at: new Date().toISOString(),
    ...data,
  })}`;

  const write = logger[level] ?? logger.warn;
  write.call(logger, message);
}
