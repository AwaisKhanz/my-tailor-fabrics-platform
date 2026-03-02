"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const branch_guard_1 = require("./common/guards/branch.guard");
const audit_interceptor_1 = require("./common/interceptors/audit.interceptor");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const search_module_1 = require("./search/search.module");
const customers_module_1 = require("./customers/customers.module");
const employees_module_1 = require("./employees/employees.module");
const schedule_1 = require("@nestjs/schedule");
const orders_module_1 = require("./orders/orders.module");
const scheduler_module_1 = require("./scheduler/scheduler.module");
const config_module_1 = require("./config/config.module");
const payments_module_1 = require("./payments/payments.module");
const reports_module_1 = require("./reports/reports.module");
const expenses_module_1 = require("./expenses/expenses.module");
const attendance_module_1 = require("./attendance/attendance.module");
const branches_module_1 = require("./branches/branches.module");
const throttler_1 = require("@nestjs/throttler");
const mail_module_1 = require("./mail/mail.module");
const tasks_module_1 = require("./tasks/tasks.module");
const rates_module_1 = require("./rates/rates.module");
const ledger_module_1 = require("./ledger/ledger.module");
const design_types_module_1 = require("./design-types/design-types.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async () => {
                    const redisUrl = process.env.REDIS_URL;
                    if (redisUrl &&
                        (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://'))) {
                        return {
                            store: await (0, cache_manager_redis_yet_1.redisStore)({
                                url: redisUrl,
                            }),
                        };
                    }
                    return { store: 'memory', ttl: 30000 };
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            search_module_1.SearchModule,
            customers_module_1.CustomersModule,
            employees_module_1.EmployeesModule,
            orders_module_1.OrdersModule,
            scheduler_module_1.SchedulerModule,
            config_module_1.AppConfigModule,
            payments_module_1.PaymentsModule,
            reports_module_1.ReportsModule,
            expenses_module_1.ExpensesModule,
            attendance_module_1.AttendanceModule,
            branches_module_1.BranchesModule,
            mail_module_1.MailModule,
            tasks_module_1.TasksModule,
            rates_module_1.RatesModule,
            ledger_module_1.LedgerModule,
            design_types_module_1.DesignTypesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: branch_guard_1.BranchGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map