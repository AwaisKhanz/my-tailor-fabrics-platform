import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { BranchGuard } from './common/guards/branch.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
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
import { AttendanceModule } from './attendance/attendance.module';
import { BranchesModule } from './branches/branches.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    UsersModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl && (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://'))) {
          return {
            store: await redisStore({
              url: redisUrl,
            }),
          };
        }
        // Fallback to in-memory store for local dev without redis
        return { store: 'memory', ttl: 30000 };
      },
    }),
    ScheduleModule.forRoot(),
    SearchModule,
    CustomersModule,
    EmployeesModule,
    OrdersModule,
    SchedulerModule,
    AppConfigModule,
    PaymentsModule,
    ReportsModule,
    ExpensesModule,
    AttendanceModule,
    BranchesModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
      useClass: BranchGuard,
    },
    {
      // Note: Because it's provided here globally, it's injected with PrismaService automatically
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    }
  ],
})
export class AppModule {}
