import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { BranchGuard } from './common/guards/branch.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { CacheModule } from '@nestjs/cache-manager';
import { SearchModule } from './search/search.module';
import { CustomersModule } from './customers/customers.module';
import { EmployeesModule } from './employees/employees.module';
import { ScheduleModule } from '@nestjs/schedule';
import { OrdersModule } from './orders/orders.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { AppConfigModule } from './config/config.module';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BranchesModule } from './branches/branches.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { MailModule } from './mail/mail.module';
import { TasksModule } from './tasks/tasks.module';
import { RatesModule } from './rates/rates.module';
import { LedgerModule } from './ledger/ledger.module';
import { DesignTypesModule } from './design-types/design-types.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { FabricsModule } from './fabrics/fabrics.module';
import { MarketingModule } from './marketing/marketing.module';
import { isInternalSchedulerEnabled } from './common/env';

const schedulerImports = isInternalSchedulerEnabled()
  ? [ScheduleModule.forRoot(), SchedulerModule]
  : [];

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: 30000,
    }),
    SearchModule,
    CustomersModule,
    EmployeesModule,
    OrdersModule,
    AppConfigModule,
    PaymentsModule,
    ReportsModule,
    ExpensesModule,
    BranchesModule,
    MailModule,
    TasksModule,
    RatesModule,
    LedgerModule,
    DesignTypesModule,
    FabricsModule,
    AuditLogsModule,
    MarketingModule,
    ...schedulerImports,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: BranchGuard,
    },
    {
      // Note: Because it's provided here globally, it's injected with PrismaService automatically
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
