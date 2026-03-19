import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, catchError, concatMap, from, map, throwError } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import type { Request } from 'express';
import type { AuthenticatedRequest } from '../interfaces/request.interface';
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITIES,
  AUDIT_UNKNOWN_ENTITY,
} from '@tbms/shared-constants';
import { isRecord, toAuditJsonValue } from './audit-log-json';

type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type AuditAction = (typeof AUDIT_ACTIONS)[number];
type AuditEntity = (typeof AUDIT_ENTITIES)[number];
type KnownAuditEntity = Exclude<AuditEntity, typeof AUDIT_UNKNOWN_ENTITY>;

type AuditRequest = Request & {
  user?: AuthenticatedRequest['user'];
  branchId?: string | null;
  params?: Record<string, string | undefined>;
  body?: unknown;
};

type PersistAuditLogInput = {
  request: AuditRequest;
  method: MutationMethod;
  action: AuditAction;
  entity: AuditEntity;
  fallbackEntityId: string | null;
  oldValue: unknown;
  body: unknown;
  response?: unknown;
  error?: unknown;
};

type ResolvedAuditActor = {
  userId: string | null;
  branchId: string | null;
  actorEmail: string | null;
};

const AUDIT_ENTITY_VALUES = new Set<string>(AUDIT_ENTITIES);

type AuditEntityRule = {
  entity: KnownAuditEntity;
  paramKeys: readonly string[];
  matches: (routePath: string) => boolean;
};

const AUDIT_ENTITY_RULES: readonly AuditEntityRule[] = [
  {
    entity: 'User',
    paramKeys: ['id'],
    matches: (routePath) => routePath.includes('/auth/'),
  },
  {
    entity: 'OrderItem',
    paramKeys: ['itemId', 'id'],
    matches: (routePath) =>
      routePath.includes('/orders/') && routePath.includes('/items/'),
  },
  {
    entity: 'Payment',
    paramKeys: ['paymentId', 'id'],
    matches: (routePath) =>
      routePath.includes('/orders/') && routePath.includes('/payments'),
  },
  {
    entity: 'ExpenseCategory',
    paramKeys: ['categoryId', 'id'],
    matches: (routePath) => routePath.includes('/expenses/categories'),
  },
  {
    entity: 'MeasurementField',
    paramKeys: ['id'],
    matches: (routePath) => routePath.includes('/measurement-fields'),
  },
  {
    entity: 'MeasurementSection',
    paramKeys: ['sectionId', 'id'],
    matches: (routePath) => routePath.includes('/measurement-sections'),
  },
  {
    entity: 'MeasurementCategory',
    paramKeys: ['categoryId', 'id'],
    matches: (routePath) => routePath.includes('/measurement-categories'),
  },
  {
    entity: 'Customer',
    paramKeys: ['id'],
    matches: (routePath) => routePath.includes('/customers'),
  },
  {
    entity: 'Employee',
    paramKeys: ['employeeId', 'id'],
    matches: (routePath) => routePath.includes('/employees'),
  },
  {
    entity: 'Task',
    paramKeys: ['id'],
    matches: (routePath) => routePath.includes('/tasks'),
  },
  {
    entity: 'Payment',
    paramKeys: ['paymentId', 'id'],
    matches: (routePath) => routePath.includes('/payments'),
  },
  {
    entity: 'Expense',
    paramKeys: ['id'],
    matches: (routePath) => routePath.includes('/expenses'),
  },
  {
    entity: 'Branch',
    paramKeys: ['id'],
    matches: (routePath) => routePath.includes('/branches'),
  },
  {
    entity: 'User',
    paramKeys: ['id'],
    matches: (routePath) => routePath.includes('/users'),
  },
  {
    entity: 'RateCard',
    paramKeys: ['id'],
    matches: (routePath) => routePath.includes('/rates'),
  },
  {
    entity: 'DesignType',
    paramKeys: ['id'],
    matches: (routePath) => routePath.includes('/design-types'),
  },
  {
    entity: 'GarmentType',
    paramKeys: ['garmentTypeId', 'id'],
    matches: (routePath) => routePath.includes('/garment-types'),
  },
  {
    entity: 'Order',
    paramKeys: ['id'],
    matches: (routePath) => routePath.includes('/orders'),
  },
] as const;

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<AuditRequest>();
    const method = this.resolveMutationMethod(request.method);
    if (!method) {
      return next.handle();
    }

    const user = request.user;
    const body: unknown = request.body;

    const routePath = this.getRoutePath(request);
    const action = this.resolveAction(method, routePath);
    if (!user?.userId && action !== 'LOGIN') {
      return next.handle();
    }

    const entityRule = this.resolveEntityRule(routePath);
    const entity = entityRule?.entity ?? AUDIT_UNKNOWN_ENTITY;
    const entityId = this.resolveEntityId(request, entityRule);
    const oldValue = await this.loadOldValue(method, entity, entityId);

    return next.handle().pipe(
      concatMap((response: unknown) => {
        const responseValue = response;
        return from(
          this.safelyPersistAuditLog({
            request,
            method,
            action,
            entity,
            fallbackEntityId: entityId,
            oldValue,
            body,
            response: responseValue,
          }),
        ).pipe(map((): unknown => responseValue));
      }),
      catchError((error: unknown) =>
        from(
          this.safelyPersistAuditLog({
            request,
            method,
            action: this.resolveFailedAction(action),
            entity,
            fallbackEntityId: entityId,
            oldValue,
            body,
            error,
          }),
        ).pipe(concatMap(() => throwError(() => error))),
      ),
    );
  }

  private resolveMutationMethod(
    method: string | undefined,
  ): MutationMethod | null {
    const normalized = (method ?? '').toUpperCase();
    if (normalized === 'POST') return 'POST';
    if (normalized === 'PUT') return 'PUT';
    if (normalized === 'PATCH') return 'PATCH';
    if (normalized === 'DELETE') return 'DELETE';
    return null;
  }

  private async safelyPersistAuditLog(input: PersistAuditLogInput) {
    try {
      await this.persistAuditLog(input);
    } catch (error: unknown) {
      this.logger.error(
        'Unexpected audit persistence failure',
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
    }
  }

  private getRoutePath(request: AuditRequest): string {
    const url = request.originalUrl || request.url || '';
    const [pathOnly] = url.split('?');
    return pathOnly.toLowerCase();
  }

  private resolveAction(
    method: MutationMethod,
    routePath: string,
  ): AuditAction {
    if (method === 'POST' && routePath.includes('/auth/login')) {
      return 'LOGIN';
    }
    if (method === 'POST' && routePath.includes('/auth/logout')) {
      return 'LOGOUT';
    }
    if (method === 'POST' && routePath.includes('/auth/refresh')) {
      return 'TOKEN_REFRESH';
    }
    if (method === 'POST') {
      return 'CREATE';
    }
    if (method === 'DELETE') {
      return 'DELETE';
    }
    return 'UPDATE';
  }

  private resolveFailedAction(action: AuditAction): AuditAction {
    if (action === 'LOGIN') {
      return 'LOGIN_FAILED';
    }
    return action;
  }

  private resolveEntityRule(routePath: string): AuditEntityRule | null {
    return AUDIT_ENTITY_RULES.find((rule) => rule.matches(routePath)) ?? null;
  }

  private resolveEntityId(
    request: AuditRequest,
    entityRule: AuditEntityRule | null,
  ): string | null {
    const params = request.params ?? {};

    if (entityRule) {
      for (const key of entityRule.paramKeys) {
        const value = params[key];
        if (value) {
          return value;
        }
      }
    }

    if (isRecord(request.body)) {
      const bodyId = request.body['id'];
      if (typeof bodyId === 'string' && bodyId.trim().length > 0) {
        return bodyId;
      }
    }

    return null;
  }

  private async loadOldValue(
    method: MutationMethod,
    entity: AuditEntity,
    entityId: string | null,
  ): Promise<unknown> {
    if (
      !entityId ||
      entity === AUDIT_UNKNOWN_ENTITY ||
      method === 'POST' ||
      !AUDIT_ENTITY_VALUES.has(entity)
    ) {
      return null;
    }

    try {
      switch (entity) {
        case 'Customer':
          return this.prisma.customer.findFirst({ where: { id: entityId } });
        case 'Employee':
          return this.prisma.employee.findFirst({ where: { id: entityId } });
        case 'Order':
          return this.prisma.order.findFirst({ where: { id: entityId } });
        case 'OrderItem':
          return this.prisma.orderItem.findFirst({ where: { id: entityId } });
        case 'Task':
          return this.prisma.orderItemTask.findFirst({
            where: { id: entityId },
          });
        case 'Payment':
          return this.prisma.payment.findFirst({ where: { id: entityId } });
        case 'Expense':
          return this.prisma.expense.findFirst({ where: { id: entityId } });
        case 'ExpenseCategory':
          return this.prisma.expenseCategory.findFirst({
            where: { id: entityId },
          });
        case 'Branch':
          return this.prisma.branch.findFirst({ where: { id: entityId } });
        case 'User':
          return this.prisma.user.findFirst({ where: { id: entityId } });
        case 'GarmentType':
          return this.prisma.garmentType.findFirst({ where: { id: entityId } });
        case 'MeasurementCategory':
          return this.prisma.measurementCategory.findFirst({
            where: { id: entityId },
          });
        case 'MeasurementField':
          return this.prisma.measurementField.findFirst({
            where: { id: entityId },
          });
        case 'MeasurementSection':
          return this.prisma.measurementSection.findFirst({
            where: { id: entityId },
          });
        case 'DesignType':
          return this.prisma.designType.findFirst({ where: { id: entityId } });
        case 'RateCard':
          return this.prisma.rateCard.findFirst({ where: { id: entityId } });
        default:
          return null;
      }
    } catch {
      this.logger.warn(`Could not fetch old value for ${entity}:${entityId}`);
      return null;
    }
  }

  private resolveResponseEntityId(response: unknown): string | null {
    if (!isRecord(response)) {
      return null;
    }

    const data = response['data'];
    if (isRecord(data) && typeof data['id'] === 'string') {
      return data['id'];
    }

    if (typeof response['id'] === 'string') {
      return response['id'];
    }

    return null;
  }

  private resolveResponseUser(response: unknown): {
    userId: string;
    branchId: string | null;
  } | null {
    if (!isRecord(response)) {
      return null;
    }

    const data = response['data'];
    if (!isRecord(data)) {
      return null;
    }

    const user = data['user'];
    if (!isRecord(user) || typeof user['id'] !== 'string') {
      return null;
    }

    const branchId =
      typeof user['branchId'] === 'string' && user['branchId'].trim().length > 0
        ? user['branchId']
        : null;

    return {
      userId: user['id'],
      branchId,
    };
  }

  private resolveLoginEmail(body: unknown): string | null {
    if (!isRecord(body)) {
      return null;
    }

    const value = body['email'];
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }

  private async resolveActorForAudit(
    request: AuditRequest,
    action: AuditAction,
    response?: unknown,
    body?: unknown,
  ): Promise<ResolvedAuditActor | null> {
    if (request.user?.userId) {
      return {
        userId: request.user.userId,
        branchId: request.branchId ?? request.user.branchId ?? null,
        actorEmail: null,
      };
    }

    if (action !== 'LOGIN' && action !== 'LOGIN_FAILED') {
      return null;
    }

    const responseUser = this.resolveResponseUser(response);
    const loginEmail = this.resolveLoginEmail(body);
    if (responseUser) {
      return {
        ...responseUser,
        actorEmail: loginEmail,
      };
    }

    if (!loginEmail) {
      return {
        userId: null,
        branchId: null,
        actorEmail: null,
      };
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: loginEmail, mode: 'insensitive' },
        deletedAt: null,
      },
      select: { id: true, branchId: true },
    });

    if (!user) {
      return {
        userId: null,
        branchId: null,
        actorEmail: loginEmail,
      };
    }

    return {
      userId: user.id,
      branchId: user.branchId ?? null,
      actorEmail: loginEmail,
    };
  }

  private resolveErrorSummary(error: unknown): {
    message: string;
    statusCode?: number;
  } {
    if (error instanceof Error) {
      return { message: error.message };
    }

    if (!isRecord(error)) {
      return { message: 'Request failed' };
    }

    const messageValue = error['message'];
    const statusCodeValue = error['statusCode'];
    const statusValue = error['status'];

    const message =
      typeof messageValue === 'string'
        ? messageValue
        : Array.isArray(messageValue) && typeof messageValue[0] === 'string'
          ? messageValue[0]
          : 'Request failed';

    const statusCode =
      typeof statusCodeValue === 'number'
        ? statusCodeValue
        : typeof statusValue === 'number'
          ? statusValue
          : undefined;

    return { message, statusCode };
  }

  private async persistAuditLog({
    request,
    method,
    action,
    entity,
    fallbackEntityId,
    oldValue,
    body,
    response,
    error,
  }: PersistAuditLogInput) {
    const actor = await this.resolveActorForAudit(
      request,
      action,
      response,
      body,
    );
    if (!actor) {
      return;
    }

    const responseEntityId = this.resolveResponseEntityId(response);
    const entityId =
      responseEntityId ??
      fallbackEntityId ??
      actor.userId ??
      actor.actorEmail ??
      'unknown';
    const userAgent = request.get('user-agent');
    const errorSummary = error ? this.resolveErrorSummary(error) : null;

    const newValuePayload =
      method === 'DELETE' && !error
        ? Prisma.JsonNull
        : errorSummary
          ? toAuditJsonValue({
              failed: true,
              error: errorSummary.message,
              statusCode: errorSummary.statusCode,
              requestBody: body,
            })
          : toAuditJsonValue(body);

    await this.prisma.auditLog
      .create({
        data: {
          userId: actor.userId,
          actorEmail: actor.actorEmail,
          action,
          entity,
          entityId,
          branchId: actor.branchId,
          oldValue: toAuditJsonValue(oldValue),
          newValue: newValuePayload,
          ipAddress: request.ip,
          userAgent,
        },
      })
      .catch((persistError: unknown) => {
        this.logger.error(
          `Failed to write audit log for ${action} ${entity}:${entityId}`,
          persistError instanceof Error
            ? persistError.stack
            : JSON.stringify(persistError),
        );
      });
  }
}
