import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const method = request.method;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const { user, body, url, params } = request;
    if (!user?.userId) return next.handle();

    // Map HTTP methods to actions
    let action = 'UPDATE';
    if (method === 'POST') action = 'CREATE';
    if (method === 'DELETE') action = 'DELETE';
    if (url.includes('login')) action = 'LOGIN';

    // Better entity detection
    const pathParts = url.split('/').filter(Boolean);
    let entity = 'Unknown';
    if (pathParts.includes('customers')) entity = 'Customer';
    else if (pathParts.includes('employees')) entity = 'Employee';
    else if (pathParts.includes('orders')) entity = 'Order';
    else if (pathParts.includes('payments')) entity = 'Payment';
    else if (pathParts.includes('expenses')) entity = 'Expense';
    else if (pathParts.includes('branches')) entity = 'Branch';
    else if (pathParts.includes('users')) entity = 'User';
    else if (pathParts.includes('garment-types')) entity = 'GarmentType';
    else if (pathParts.includes('measurement-categories'))
      entity = 'MeasurementCategory';

    const entityId = params?.id || body?.id || 'unknown';

    let oldValue: unknown = null;

    // Capture oldValue for updates/deletes
    if (
      ['PUT', 'PATCH', 'DELETE'].includes(method) &&
      entity !== 'Unknown' &&
      entityId !== 'unknown'
    ) {
      try {
        const modelName = entity.charAt(0).toLowerCase() + entity.slice(1);
        // @ts-ignore
        if (this.prisma[modelName]) {
          // @ts-ignore
          oldValue = await this.prisma[modelName].findUnique({
            where: { id: entityId },
          });
        }
      } catch (err) {
        this.logger.warn(`Could not fetch oldValue for ${entity}:${entityId}`);
      }
    }

    return next.handle().pipe(
      tap((response) => {
        const entityIdFromRes = response?.data?.id || response?.id || entityId;

        this.prisma.auditLog
          .create({
            data: {
              userId: user.userId,
              action,
              entity,
              entityId: String(entityIdFromRes),
              branchId: user.branchId || null,
              oldValue: oldValue
                ? (oldValue as Prisma.InputJsonValue)
                : Prisma.JsonNull,
              newValue:
                method === 'DELETE'
                  ? Prisma.JsonNull
                  : body
                    ? (body as Prisma.InputJsonValue)
                    : Prisma.JsonNull,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            },
          })
          .catch((err: unknown) => {
            this.logger.error('Audit Log failed:', err);
          });
      }),
    );
  }
}
